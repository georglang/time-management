import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TimeRecord, ITimeRecord } from '../data-classes/TimeRecords';
import { DateAdapter } from '@angular/material/core';
import { FirestoreOrderService } from '../service/firestore-order-service/firestore-order.service';
import { FirestoreRecordService } from '../service/firestore-record-service/firestore-record.service';
import { MessageService } from '../service/message-service/message.service';
import { IndexedDBService } from '../service/indexedDb-service/indexedDb.service';

@Component({
  selector: 'app-edit-record',
  templateUrl: './edit-record.component.html',
  styleUrls: ['./edit-record.component.sass']
})
export class EditRecordComponent implements OnInit {
  public editRecordForm: FormGroup;
  private recordId: string;
  private orderId: string;
  public formatedDate: string;
  public record: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    private firestoreOrderService: FirestoreOrderService,
    private firestoreRecordService: FirestoreRecordService,
    private messageService: MessageService,
    private indexedDBService: IndexedDBService
  ) {
    this.dateAdapter.setLocale('de');
  }

  ngOnInit() {
    this.editRecordForm = this.formBuilder.group({
      id: [''],
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: [0, Validators.required]
    });

    this.route.parent.url.subscribe(urlPath => {
      this.orderId = urlPath[1].path;
    });

    this.route.params.subscribe(params => {
      this.recordId = params['id'];

      if (this.isOnline()) {
        this.getRecordByIdFromFirebase(this.orderId, this.recordId);
      }

      //   // ordersOutbox
      // } else {

      //   // Kombination von ordersOutbox und recordsOutbox

      //   this.getRecordsByIdFromRecordsOutbox(+this.recordId);
      // }

      // this.getRecordsByIdFromRecordsOutbox(+this.recordId);
    });

    // ToDo implement change detection notification
    this.editRecordForm.valueChanges.subscribe(changes => {
      console.log('Changes', changes);
    });
  }

  public isOnline(): boolean {
    return navigator.onLine;
  }

  public getRecordByIdFromFirebase(orderId: string, recordId: string): void {
    this.firestoreRecordService.getRecordById(orderId).subscribe((record: ITimeRecord) => {
      if (record !== undefined) {
        this.setControl(record[0]);
      }
    });
  }

  public getRecordsByIdFromRecordsOutbox(recordId: number): void {
    this.indexedDBService.getRecordByIdFromRecordsOutbox(recordId).then(record => {
      this.record = record;
      if (this.record !== undefined) {
        this.setControl(this.record);
      }
    });
  }

  public navigateToOrderList(): void {
    this.router.navigate(['/order-details', this.orderId]);
  }

  public setControl(record: TimeRecord): void {
    this.editRecordForm.setValue({
      id: record.id,
      date: record.date,
      description: record.description,
      workingHours: record.workingHours
    });
  }

  public onSubmit() {
    const record = {
      date: this.editRecordForm.controls.date.value,
      description: this.editRecordForm.controls.description.value,
      workingHours: this.editRecordForm.controls.workingHours.value,
      id: this.recordId,
      orderId: this.orderId
    };

    if (this.isOnline()) {
      this.firestoreRecordService
        .checkIfRecordExistsInOrderInFirestore(record)
        .then(doesRecordExist => {
          if (!doesRecordExist) {
            this.updateRecordInFirestore(this.orderId, record);
          } else {
            this.messageService.recordAlreadyExists();
          }
        });
    } else {
      this.updateRecordInRecordsOutbox(record);
    }
  }

  private updateRecordInFirestore(orderId: string, record: ITimeRecord): void {
    this.firestoreOrderService.ordersCollection
      .doc(orderId)
      .collection('records')
      .doc(this.recordId)
      .update(record)
      .then(() => {
        this.updateRecordInOrdersTable(+orderId, record);
      });
  }

  private updateRecordInOrdersTable(orderId, record): void {
    this.indexedDBService.updateRecordInOrdersTable(orderId, record).then(() => {
      this.messageService.recordUpdatedSuccessful();
    });
  }

  private updateRecordInRecordsOutbox(record: ITimeRecord): void {
    this.indexedDBService
      .doesRecordsOutboxContainRecords()
      .then(doesRecordsOutboxContainRecords => {
        this.indexedDBService
          .checkIfRecordIsInRecordsOutboxTable(record)
          .then(isAlreadyInRecordsOutboxTable => {
            if (!isAlreadyInRecordsOutboxTable) {
              if (doesRecordsOutboxContainRecords) {
                if (this.indexedDBService.updateRecordInRecordsOutboxTable(record)) {
                  this.messageService.recordUpdatedSuccessful();
                } else {
                  this.messageService.recordCouldNotBeUpdated();
                }
              }
            } else {
              this.messageService.recordAlreadyExists();
            }
          });
      });
  }
}
