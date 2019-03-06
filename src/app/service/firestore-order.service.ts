import { Injectable, OnInit } from '@angular/core';
import { Timestamp, QuerySnapshot } from '@firebase/firestore-types';

// import * as firebase from 'firebase';
// import 'firebase/firestore';
// import 'firebase/database';

import { IOrder, Order, IFlattenOrder } from '../data-classes/Order';
import { TimeRecord, ITimeRecord } from '../data-classes/ITimeRecords';
import { FirestoreRecordService } from './firestore-record.service';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
  DocumentChangeAction,
  Action,
  DocumentSnapshotDoesNotExist,
  DocumentSnapshotExists
} from '@angular/fire/firestore';

import { Observable, from } from 'rxjs';
import { map, tap, take, switchMap, mergeMap, expand, takeWhile } from 'rxjs/operators';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FirestoreOrderService {
  public ordersCollection: AngularFirestoreCollection<IOrder>;
  public recordsCollection: AngularFirestoreCollection<ITimeRecord>;
  public order: Observable<IOrder[]>;
  private orders: Observable<IOrder[]>;
  private ordersInFirestore: any[] = [];

  constructor(private firestore: AngularFirestore, private firestoreRecordService: FirestoreRecordService) {
    this.ordersCollection = this.firestore.collection<IOrder>('orders');
    this.recordsCollection = this.firestore.collection<ITimeRecord>('records');
  }

  /// orders collection methods

  public getOrders(): Observable<IOrder[]> {
    return (this.orders = this.ordersCollection
      .snapshotChanges()
      .pipe(map(actions => actions.map(this.documentToDomainObject))));
  }

  public getOrdersFromOrdersCollection(): Promise<IOrder[]> {
    return this.ordersCollection.ref.get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.ordersInFirestore.push(doc.data());
        return doc.data();
      });
      return this.ordersInFirestore;
    });
  }

  documentToDomainObject = dToDO => {
    const object = dToDO.payload.doc.data();
    object.id = dToDO.payload.doc.id;
    return object;
  };

  // add order and return new created firebase id
  public addOrder(order: IOrder): Promise<any> {
    const _order = JSON.parse(JSON.stringify(order));
    delete _order.id;
    return this.ordersCollection
      .add(_order)
      .then(docReference => {
        return docReference.id;
      })
      .catch(error => {
        console.error('Error adding order: ', error);
      });
  }

  public getOrderById(orderId: string): Promise<any> {
    return this.ordersCollection
      .doc(orderId)
      .ref.get()
      .then(doc => {
        if (doc.exists) {
          const data: IOrder = Object.assign(doc.data());
          return data;
        }
      })
      .catch(function(error) {
        console.log('getOrderById: no order found', error);
      });
  }

  // get orders from orders collection with depending records from records collection
  public getOrdersWithRecords(): Promise<IOrder[]> {
    const _orders: IOrder[] = [];
    return new Promise((resolve, reject) => {
      this.getOrdersFromOrdersCollection().then((orders: IOrder[]) => {
        if (orders.length > 0) {
          orders.forEach(order => {
            this.firestoreRecordService.getRecordsByOrderId(order.id).subscribe((records: ITimeRecord[]) => {
              if (records.length > 0) {
                order.records = records;
                _orders.push(order);
              } else {
                _orders.push(order);
              }
              resolve(_orders);
            });
          });
        }
      });
    });
  }

  // Todo: evt. auch order. record in flatten order aufnehmen
  public checkIfOrderExists(order: IOrder): Promise<boolean> {
    let isAlreadyInFirestore = true;
    const orders: IFlattenOrder[] = []; // without id
    return new Promise((resolve, reject) => {
      this.getOrdersFromOrdersCollection().then((ordersInFirestore: IOrder[]) => {
        if (ordersInFirestore !== undefined) {
          if (ordersInFirestore.length > 0) {
            const newOrder = {
              companyName: order.companyName,
              location: order.location,
              contactPerson: order.contactPerson
            };

            ordersInFirestore.forEach(orderInFirestore => {
              orders.push({
                companyName: orderInFirestore.companyName,
                location: orderInFirestore.location,
                contactPerson: orderInFirestore.contactPerson
              });
            });
            isAlreadyInFirestore = _.findIndex(orders, o => _.isMatch(o, newOrder)) > -1;
            resolve(isAlreadyInFirestore);
          } else {
            resolve(false);
          }
        }
      });
    });
  }
}
