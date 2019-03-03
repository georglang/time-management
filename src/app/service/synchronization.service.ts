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
                    this.cloudFirestoreService.addOrder(order).then((idFromFirebase: string) => {
                      order.id = idFromFirebase;
                      // update depending records in recordsOutbox
                      this.indexedDBService
                        .doesRecordsOutboxContainRecords()
                        .then(doesRecordsOutboxContainOrders => {
                          if (doesRecordsOutboxContainOrders) {
                            this.indexedDBService
                              .updateLocalIdOfRecordsOutboxWithFirebaseId(localId, idFromFirebase)
                              .then(hasBeenUpdated => {
                                if (hasBeenUpdated) {
                                  this.indexedDBService.addToOrdersTable(order).then(() => {
                                    this.indexedDBService.deleteOrderInOutbox(localId);
                                    resolve(true);
                                  });
                                }
                              });
                          } else {
                            this.indexedDBService.addToOrdersTable(order).then(() => {
                              this.indexedDBService.deleteOrderInOutbox(localId);
                              resolve(true);
                            });
                          }
                        });
                    });
                  } else {
                    this.indexedDBService.deleteOrderInOutbox(order.id);
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
                    this.cloudFirestoreService.addTimeRecord(record.orderId, record).then((idFromFirebase: string) => {
                      record.id = idFromFirebase;
                      this.indexedDBService
                        .addRecordToOrdersTable(record, record.orderId)
                        .then(() => {
                          this.indexedDBService.deleteRecordInOutbox(localId);
                          resolve(true);
                        });
                    });
                  } else {
                    this.indexedDBService.deleteRecordInOutbox(record.id);
                    resolve(true);
                  }
                });
            });
          }
        }
      });
    });
  }
}
