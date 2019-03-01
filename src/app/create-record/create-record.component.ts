import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexedDBService } from '../service/indexedDb.service';
import { ITimeRecord } from '../data-classes/ITimeRecords';
import { ToastrService, Toast } from 'ngx-toastr';
import { CloudFirestoreService } from '../service/cloudFirestore.service';
import { MessageService } from './../service/message.service';

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
    private indexDbService: IndexedDBService,
    private toastr: ToastrService,
    private cloudFirestoreService: CloudFirestoreService,
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

  public isConnected() {
    return navigator.onLine;
  }

  public navigateToOrderList() {
    this.router.navigate(['/order-details', this.routeParamOrderId]);
  }

  public showSuccess() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.success('Erfolgreich erstellt', 'Eintrag', successConfig);
  }

  public createRecordIfOnline(newRecord: ITimeRecord, orderId: string) {
    newRecord.createdAt = new Date();
    this.cloudFirestoreService
      .checkIfRecordExistsInOrderInFirestore(orderId, newRecord)
      .then(doesRecordExist => {
        if (!doesRecordExist) {
          this.cloudFirestoreService.addTimeRecord(orderId, newRecord).then(timeRecordResponse => {
            console.log('Time Record Response', timeRecordResponse);
            this.messageService.recordSuccessfulCreated();
            this.router.navigate(['order-details', orderId]);
          });
        } else {
          this.messageService.recordAlreadyExists();
        }
      });
  }

  // if the order which the record belongs to is in ordersOutbox table, add record to order in ordersOutbox table
  // if the order which the record belongs to is not in recordsOutbox table, add record to recordsOutbox table
  public createRecordIfOffline(newRecord: ITimeRecord, orderId: string) {
    this.indexDbService
      .checkByIdIfOrderIsInIndexedDBOrdersOutboxTable(orderId)
      .then(isOrderInOrdersOutbox => {
        if (isOrderInOrdersOutbox) {
          this.indexDbService.addRecordToOrdersOutboxTable(newRecord, orderId).then(data => {
            this.messageService.recordSuccessfulCreated();
          });
        } else {
          this.indexDbService
            .checkIfRecordIsInRecordsOutboxTable(newRecord, orderId)
            .then(isAlreadyInRecordsOutboxTable => {
              if (!isAlreadyInRecordsOutboxTable) {
                newRecord.orderId = orderId;
                this.indexDbService.addRecordToRecordsOutboxTable(newRecord)
                  .then(() => {
                    this.messageService.recordSuccessfulCreated();
                  });
              } else {
                this.messageService.recordAlreadyExists();
              }
            });
        }
      });
  }

  public onSubmit() {
    // if (this.isConnected()) {
    //   this.createRecordIfOnline(this.createRecordForm.value, this.paramId);
    // } else {
    //   this.createRecordIfOffline(this.createRecordForm.value, this.paramId);
    // }
    this.createRecordIfOffline(this.createRecordForm.value, this.routeParamOrderId);
  }
}
