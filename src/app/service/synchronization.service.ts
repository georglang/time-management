import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexedDb.service';
import { CloudFirestoreService } from './cloudFirestore.service';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SynchronizationService {
  constructor(
    private indexedDBService: IndexedDBService,
    private cloudFirestoreService: CloudFirestoreService
  ) {}

  // read orders from indexedDB ordersOutbox table
  public synchronizeIndexedDBWithFirebase() {
    const ordersToPushToFirebase: string[] = [];
    this.indexedDBService.getOrdersFromOrdersOutbox().then(ordersInOutbox => {
      if (ordersInOutbox !== undefined) {
        if (ordersInOutbox.length > 0) {
          this.cloudFirestoreService.getDocumentsInOrdersCollection().then(ordersOnline => {
            ordersInOutbox.forEach(orderInOutbox => {
              const orderToCompare = {};
              Object.assign(orderToCompare, orderInOutbox);
              if (ordersOnline.length > 0) {
                if (!this.compareIfOrderIsOnline(orderToCompare, ordersOnline)) {
                  ordersToPushToFirebase.push(orderInOutbox);
                }
              } else {
                ordersToPushToFirebase.push(orderInOutbox);
              }
            });
            this.sychronizeOrdersOutbox(ordersToPushToFirebase);
          });
        } else {
          // if no orders are in ordersOutbox, synchronization is not necessary
          return;
        }
      }
    });
  }

  // records from indexedDB recordsOutbox table
  // update order with new records depending on orderId
  public synchronizeIndexedDBRecordsTableWithFirebase() {
    this.indexedDBService.getRecordsFromRecordsOutboxTable().then(records => {
      if (records !== undefined) {
        if (records.length > 0) {
          records.forEach(record => {
            this.cloudFirestoreService
              .checkIfRecordExistsInOrderInFirestore(record.orderId, record)
              .then(doesRecordExists => {
                if (!doesRecordExists) {
                  this.cloudFirestoreService.addTimeRecord(record.orderId, record).then(data => {
                    this.indexedDBService.deleteRecordInOutbox(record.id);
                  });
                }
              });
          });
        }
      }
    });
  }

  // ToDo: Refactoring: Gleiche Methode wie in edit-record.component update()
  // sollte in service ausgelagert werden
  public updateRecordByOrderId() {}

  // add order from indexedDB ordersOutbox table to firestore
  // after receiving the firestore id, add order to indexedDB orders table
  // delete order form indexedDB ordersOutbox
  public sychronizeOrdersOutbox(ordersToPushToFirebase) {
    ordersToPushToFirebase.forEach(order => {
      this.cloudFirestoreService.addOrder(order).then(id => {
        if (!this.isAlreadyInIndexedDBOrders(order, ordersToPushToFirebase)) {
          const localId = order.id;
          order.id = id;
          this.indexedDBService.addToOrdersTable(order).then(() => {
            this.indexedDBService.deleteOrderInOutbox(localId);
          });
        }
      });
    });
  }

  private compareIfOrderIsOnline(orderInOutbox, ordersOnline): boolean {
    delete orderInOutbox.createdAt;
    delete orderInOutbox.id;
    let isOrderAlreadyOnline = false;
    ordersOnline.forEach(orderOnline => {
      delete orderOnline.createdAt;
      delete orderOnline.id;
      if (_.isEqual(orderOnline, orderInOutbox)) {
        return (isOrderAlreadyOnline = true);
      }
    });
    return isOrderAlreadyOnline;
  }

  private isAlreadyInIndexedDBOrders(orderToPush, orders) {
    let isAlreadyInIndexedDB = false;
    orders.forEach(order => {
      if (_.isEqual(orderToPush, orders)) {
        return (isAlreadyInIndexedDB = true);
      }
    });
    return isAlreadyInIndexedDB;
  }
}
