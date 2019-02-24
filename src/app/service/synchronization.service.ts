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

  public synchronizeIndexedDBWithFirebase() {
    const ordersToPushToFirebase: string[] = [];
    this.indexedDBService.getOrdersFromOutbox().then(ordersInOutbox => {
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
    });
  }

  // add order from indexedDB ordersOutbox table to firestore
  // after receiving the firestore id, add order to indexedDB orders table
  // delete order form indexedDB ordersOutbox
  public sychronizeOrdersOutbox(ordersToPushToFirebase) {
    ordersToPushToFirebase.forEach(order => {
      debugger;
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
