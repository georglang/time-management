import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IndexedDBService } from '../service/indexedDb-service/indexedDb.service';
import { ITimeRecord, TimeRecord } from '../data-classes/TimeRecords';
import { FirestoreRecordService } from '../service/firestore-record-service/firestore-record.service';
import { MessageService } from '../service/message-service/message.service';
import { IOrder } from '../data-classes/Order';

// ToDo:
// Messages recordCreatedSuccessfully kontrollieren

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
    // if (this.isOnline()) {
    //   this.addRecordToFirebaseRecordsTable(record);
    // } else {
    //   this.createRecordIfOffline(orderId, record);
    // }
    // this.createRecordIfOffline(record);

    this.createRecordIfOffline(record);
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
                this.messageService.recordCreatedSuccessfully();
                this.router.navigate(['order-details', record.orderId]);
                record.id = id;
                this.addRecordToIndexedDbRecordsTable(record);
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

  public addRecordToIndexedDbRecordsTable(record: ITimeRecord): void {
    this.indexedDbService.addRecordToOrdersTable(record).then(() => {
      this.messageService.recordCreatedSuccessfully();
    });
  }

  public createRecordIfOffline(record: ITimeRecord) {
    // this.indexedDbService
    //   .checkIfRecordIsInOrdersOutboxTable(record)
    //   .then(isAlreadyInOrdersOutboxTable => {
    //     if (!isAlreadyInOrdersOutboxTable) {
    //       record.orderId = orderId;
    //       this.indexedDbService.addRecordToOrdersTable(orderId, record).then(() => {
    //         this.messageService.recordCreatedSuccessful();
    //       });
    //     } else {
    //       this.messageService.recordAlreadyExists();
    //     }
    //   });
    if (record.orderId.match(/^[a-z]+$/)) {
      // if orderId is string than get the depending order and save it with the new record to ordersOutbox
      this.indexedDbService.getOrderByFirebaseId(record.orderId).then((order: IOrder[]) => {
        if (order.length > 0) {
          this.indexedDbService
            .checkIfOrderIsInIndexedDBOrdersOutboxTable(order[0])
            .then(isAlreadyInTable => {
              if (!isAlreadyInTable) {
                this.indexedDbService.addOrderToOutbox(order[0]).then(() => {
                  this.indexedDbService.addRecordToOrdersOutboxTable(record);
                  this.indexedDbService.addRecordToOrdersTable(record).then(() => {
                    this.messageService.recordCreatedSuccessfully();
                  });
                });
              } else {
                // order is already in outbox just add the new record
                this.indexedDbService.addRecordToOrdersOutboxTable(record);
                this.indexedDbService.addRecordToOrdersTable(record);
                // Weiter hier, schauen, obs so passt
                // Probieren, ob es auch funktioniert, wenn order noch nicht existiert
              }
            });
        }
      });
    } else {
      this.indexedDbService.checkIfRecordIsInIndexedDbOrdersTable(record).then(doesRecordExists => {
        if (!doesRecordExists) {
          this.indexedDbService.addRecordToOrdersOutboxTable(record);
          this.indexedDbService.addRecordToOrdersTable(record).then(() => {
            this.messageService.recordCreatedSuccessfully();
          });
        } else {
          this.messageService.recordAlreadyExists();
        }
      });
    }
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
