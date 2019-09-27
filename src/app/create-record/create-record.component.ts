import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IndexedDBService } from '../service/indexedDb-service/indexedDb.service';
import { ITimeRecord, TimeRecord } from '../data-classes/TimeRecords';
import { ToastrService, Toast } from 'ngx-toastr';
import { FirestoreOrderService } from '../service/firestore-order-service/firestore-order.service';
import { FirestoreRecordService } from '../service/firestore-record-service/firestore-record.service';
import { MessageService } from '../service/message-service/message.service';

@Component({
  selector: 'app-create-record',
  templateUrl: './create-record.component.html',
  styleUrls: ['./create-record.component.sass']
})
export class CreateRecordComponent implements OnInit {
  public createRecordForm: FormGroup;
  private routeParamOrderId;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private indexedDbService: IndexedDBService,
    private toastr: ToastrService,
    private firestoreOrderService: FirestoreOrderService,
    private firestoreRecordService: FirestoreRecordService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.createRecordForm = this.formBuilder.group({
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: ['', Validators.required]
    });

    this.route.params.subscribe(params => {
      this.routeParamOrderId = params.id;
    });
  }

  // ToDo: recordId in firebase: Lokale id mit Online ID ersetzen
  // ToDo: createRecordIfOffline testen

  public isOnline() {
    return navigator.onLine;
  }

  public navigateToOrderList() {
    this.router.navigate(['/order-details', this.routeParamOrderId]);
  }

  // ToDo: TimeRecord, Reihenfolge von id und orderId in constructor wechseln
  // dann kann newRecord in new TimeRecord mit angegeben werden
  public createRecord(formInput: any, orderId: string): void {
    const record = new TimeRecord(formInput.date, formInput.description, formInput.workingHours);
    record.orderId = orderId;
    if (this.isOnline()) {
      this.addRecordToFirebaseRecordsTable(record);
    } else {
    }
  }

  addRecordToFirebaseRecordsTable(record: any): void {
    if (this.firestoreRecordService !== undefined) {
      // check if record is already in firestore
      this.firestoreRecordService
        .checkIfRecordExistsInOrderInFirestore(record)
        .then((isAlreadyInFirestore: boolean) => {
          if (!isAlreadyInFirestore) {
            this.firestoreRecordService
              .addTimeRecord(record)
              .then((id: string) => {
                this.messageService.recordCreatedSuccessful();
                this.router.navigate(['order-details', record.orderId]);
                record.id = id;
                this.addRecordsToIndexedDbRecordsTable(record);
              })
              .catch(e => {
                console.error('can´t create record to firebase', e);
              });
          } else {
            this.messageService.recordAlreadyExists();
          }
        });
    }
  }

  public addRecordsToIndexedDbRecordsTable(record: ITimeRecord): void {
    const _records: ITimeRecord[] = [];
    _records.push(record);
    this.indexedDbService.addRecordToOrdersTable(_records, record.orderId);
  }

  public showSuccess() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.success('Erfolgreich erstellt', 'Eintrag', successConfig);
  }

  // if the order which the record belongs to is in ordersOutbox table, add record to order in ordersOutbox table
  // if the order which the record belongs to is not in recordsOutbox table, add record to recordsOutbox table
  public createRecordIfOffline(newRecord: ITimeRecord, orderId: string) {
    this.indexedDbService
      .checkIfRecordIsInRecordsOutboxTable(newRecord)
      .then(isAlreadyInRecordsOutboxTable => {
        if (!isAlreadyInRecordsOutboxTable) {
          newRecord.orderId = orderId;
          this.indexedDbService.addRecordToRecordsOutboxTable(newRecord).then(() => {
            this.messageService.recordCreatedSuccessful();
          });
        } else {
          this.messageService.recordAlreadyExists();
        }
      });
  }

  public onSubmit() {
    this.createRecord(this.createRecordForm.value, this.routeParamOrderId);
    // if (this.isConnected()) {
    //   this.createRecordIfOnline(this.createRecordForm.value, this.paramId);
    // } else {
    //   this.createRecordIfOffline(this.createRecordForm.value, this.paramId);
    // }
    //this.createRecordIfOffline(this.createRecordForm.value, this.routeParamOrderId);
  }
}
