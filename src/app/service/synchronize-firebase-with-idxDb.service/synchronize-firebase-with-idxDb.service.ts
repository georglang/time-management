import { Injectable } from '@angular/core';
import { IOrder } from './../../data-classes/Order';
import { ITimeRecord } from '../../data-classes/TimeRecords';
import { FirestoreOrderService } from './../../service/firestore-order-service/firestore-order.service';
import { FirestoreRecordService } from './../firestore-record-service/firestore-record.service';
import { IndexedDBService } from './../indexedDb-service/indexedDb.service';

@Injectable({
  providedIn: 'root'
})
export class SynchronizeFirebaseWithIdxDbService {

  constructor(private firestoreOrderService: FirestoreOrderService, private firestoreRecordService: FirestoreRecordService, private indexedDbService: IndexedDBService) { }

  // get orders and records from firebase and save it to indexedDB orders table
  // returns true if orders are synchronized with indexedDb orders table
  public synchronize(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firestoreOrderService.getOrders().then((orders: IOrder[]) => {
        if (orders.length > 0) {
          orders.forEach((order: IOrder) => {
            this.firestoreRecordService
              .getRecordById(order.id)
              .subscribe((records: ITimeRecord[]) => {
                if (records.length > 0) {
                  order.records = records;
                }
                this.synchronizeOrdersWithIndexedDb(orders).then(isCompleted => {
                  resolve(isCompleted);
                });
              });
          });
        }
      });
    });
  }

  private synchronizeOrdersWithIndexedDb(orders): Promise<boolean> {
    return this.indexedDbService.addOrderWithRecordsToOrdersTable(orders);
  }
}


// ToDo: implement reject
