import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexedDb.service';
import { CloudFirestoreService } from './cloudFirestore.service';
import { MessageService } from './../service/message.service';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SynchronizationService {
  constructor(
    private indexedDBService: IndexedDBService,
    private cloudFirestoreService: CloudFirestoreService,
    private messageService: MessageService
  ) {}

  // if indexedDB ordersOutbox contains orders, sychronize it with firebase orders table
  // if orders are synchronized, check if indexedDB recordsOutbox contains records
  // if recordsOutbox contains records, synchronize it with firebase records table
  // if indexedDB ordersOutbox do not contain orders, sychronize record from recordsOutbox
  public synchronizeWithFirebase() {
    this.indexedDBService.doesOrdersOutboxContainOrders().then(doesOrdersExist => {
      if (doesOrdersExist) {
        this.synchronizeIndexedDbOrdersOutboxTableWithFirebase().then(isSynchronized => {
          if (isSynchronized) {
            debugger;
            this.indexedDBService.doesRecordsOutboxContainRecords().then(doesRecordsExist => {
              if (doesRecordsExist) {
                this.synchronizeIndexedDbRecordsTableWithFirebase();
              }
            });
          }
        });
      } else {
        this.indexedDBService.doesRecordsOutboxContainRecords().then(doesRecordsExist => {
          if (doesRecordsExist) {
            this.synchronizeIndexedDbRecordsTableWithFirebase();
          }
        });
      }
    });
  }

  // read orders from indexedDB ordersOutbox table
  public synchronizeIndexedDbOrdersOutboxTableWithFirebase(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.indexedDBService.getOrdersFromOrdersOutbox().then(ordersInOutbox => {
        if (ordersInOutbox !== undefined) {
          if (ordersInOutbox.length > 0) {
            ordersInOutbox.forEach(order => {
              return this.cloudFirestoreService
                .checkIfOrderExistsInFirestore(order)
                .then(doesOrderExist => {
                  if (!doesOrderExist) {
                    const localId = order.id;
                    delete order.id;
                    this.cloudFirestoreService.addOrder(order).then(idFromFirebase => {
                      order.id = idFromFirebase;
                      this.indexedDBService.addToOrdersTable(order).then(() => {
                        this.indexedDBService.deleteOrderInOutbox(localId);
                        this.messageService.orderSuccessfulCreated();
                        resolve(true);
                      });
                    });
                  } else {
                    this.indexedDBService.deleteOrderInOutbox(order.id);
                    this.messageService.orderAlreadyExists();
                    resolve(true);
                  }
                });
            });
          }
        }
      });
    });
  }

  // records from indexedDB recordsOutbox table
  // update order with new records depending on orderId
  public synchronizeIndexedDbRecordsTableWithFirebase(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.indexedDBService.getRecordsFromRecordsOutboxTable().then(records => {
        if (records !== undefined) {
          if (records.length > 0) {
            records.forEach(record => {
              return this.cloudFirestoreService
                .checkIfRecordExistsInOrderInFirestore(record.orderId, record)
                .then(doesRecordExist => {
                  if (!doesRecordExist) {
                    const localId = record.id;
                    delete record.id;
                    this.cloudFirestoreService.addTimeRecord(record.orderId, record).then(data => {
                      this.indexedDBService
                        .addRecordToOrdersTable(record, record.orderId)
                        .then(() => {
                          this.indexedDBService.deleteRecordInOutbox(localId);
                          this.messageService.recordSuccessfulCreated();
                          resolve(true);
                        });
                    });
                  } else {
                    this.indexedDBService.deleteRecordInOutbox(record.id);
                    this.messageService.recordAlreadyExists();
                    resolve(true);
                  }
                });
            });
          }
        }
      });
    });
  }

  // Weiter  machen

  // add order from indexedDB ordersOutbox table to firestore
  // after receiving the firestore id, add order to indexedDB orders table
  // delete order from indexedDB ordersOutbox
  // public sychronizeOrdersOutboxTableWithFirebase(ordersToPushToFirebase) {
  //   ordersToPushToFirebase.forEach(order => {
  //     this.cloudFirestoreService.addOrder(order).then(id => {
  //       if (!this.isAlreadyInIndexedDBOrders(order, ordersToPushToFirebase)) {
  //         const localId = order.id;
  //         order.id = id;
  //         this.indexedDBService.addToOrdersTable(order).then(() => {
  //           debugger;
  //           this.indexedDBService.deleteOrderInOutbox(localId);
  //         });
  //       } else {
  //         debugger;
  //         this.messageService.orderAlreadyExists();
  //       }
  //     });
  //   });
  // }

  // private compareIfOrderIsOnline(orderInOutbox, ordersOnline): boolean {
  //   delete orderInOutbox.createdAt;
  //   delete orderInOutbox.id;
  //   let isOrderAlreadyOnline = false;
  //   ordersOnline.forEach(orderOnline => {
  //     delete orderOnline.createdAt;
  //     delete orderOnline.id;
  //     if (_.isEqual(orderOnline, orderInOutbox)) {
  //       return (isOrderAlreadyOnline = true);
  //     }
  //   });
  //   return isOrderAlreadyOnline;
  // }

  // private isAlreadyInIndexedDBOrders(orderToPush, orders) {
  //   let isAlreadyInIndexedDB = false;
  //   orders.forEach(order => {
  //     if (_.isEqual(orderToPush, orders)) {
  //       return (isAlreadyInIndexedDB = true);
  //     }
  //   });
  //   return isAlreadyInIndexedDB;
  // }
}
