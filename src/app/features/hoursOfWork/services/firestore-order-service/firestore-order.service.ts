import { Injectable, OnInit } from '@angular/core';
import { Timestamp, QuerySnapshot } from '@firebase/firestore-types';

// import * as firebase from 'firebase';
// import 'firebase/firestore';
// import 'firebase/database';

import { IOrder, Order, IFlattenOrder } from '../../data-classes/Order';
import { TimeRecord, ITimeRecord } from '../../data-classes/TimeRecords';
import { FirestoreRecordService } from '../firestore-record-service/firestore-record.service';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
  DocumentChangeAction,
  Action,
  DocumentSnapshotDoesNotExist,
  DocumentSnapshotExists,
} from '@angular/fire/firestore';

import { Observable, from } from 'rxjs';
import {
  map,
  tap,
  take,
  switchMap,
  mergeMap,
  expand,
  takeWhile,
} from 'rxjs/operators';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class FirestoreOrderService {
  public ordersCollection: AngularFirestoreCollection<IOrder>;
  public recordsCollection: AngularFirestoreCollection<ITimeRecord>;
  public order: Observable<IOrder[]>;
  private orders: Observable<IOrder[]>;
  private ordersInFirestore: any[] = [];

  constructor(
    private firestore: AngularFirestore,
    private firestoreRecordService: FirestoreRecordService
  ) {
    this.ordersCollection = this.firestore.collection<IOrder>('orders');
    this.recordsCollection = this.firestore.collection<ITimeRecord>('records');
  }

  public getOrders(): Observable<IOrder[]> {
    const observable = new Observable<IOrder[]>((observer) => {
      this.ordersCollection
        .snapshotChanges()
        .pipe(map((actions) => actions.map(this.documentToDomainObject)))
        .subscribe((orders: IOrder[]) => {
          if (orders.length > 0) {
            observer.next(orders);
          }
        });
    });
    return observable;
  }

  public getOrderById(orderId: string): Promise<any> {
    return this.ordersCollection
      .doc(orderId)
      .ref.get()
      .then((doc) => {
        if (doc.exists) {
          const data: IOrder = Object.assign(doc.data());
          return data;
        }
      })
      .catch(function (error) {
        console.log('getOrderById: no order found', error);
      });
  }

  public getOrdersFromOrdersCollection(): Promise<IOrder[]> {
    return this.ordersCollection.ref.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.ordersInFirestore.push(doc.data());
        return doc.data();
      });
      return this.ordersInFirestore;
    });
  }

  public getOrdersFromOrdersCollection2() {
    return this.ordersCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as IOrder;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  documentToDomainObject = (dToDO) => {
    const object = dToDO.payload.doc.data();
    object.id = dToDO.payload.doc.id;
    return object;
  };

  // add order and return new created firebase id
  public addOrder(order: IOrder): Promise<any> {
    const _order = { ...order };
    return this.ordersCollection
      .add(_order)
      .then((docReference) => {
        return docReference.id;
      })
      .catch((error) => {
        console.error('Error adding order: ', error);
      });
  }

  public checkIfOrderExists(order: IOrder): Promise<boolean> {
    let isAlreadyInFirestore = true;
    const orders: IFlattenOrder[] = []; // without id
    return new Promise((resolve, reject) => {
      this.getOrdersFromOrdersCollection().then(
        (ordersInFirestore: IOrder[]) => {
          if (ordersInFirestore !== undefined) {
            if (ordersInFirestore.length > 0) {
              const newOrder = {
                companyName: order.companyName,
                location: order.location,
                contactPerson: order.contactPerson,
              };

              ordersInFirestore.forEach((orderInFirestore) => {
                orders.push({
                  companyName: orderInFirestore.companyName,
                  location: orderInFirestore.location,
                  contactPerson: orderInFirestore.contactPerson,
                });
              });
              isAlreadyInFirestore =
                _.findIndex(orders, (o) => _.isMatch(o, newOrder)) > -1;
              resolve(isAlreadyInFirestore);
            } else {
              resolve(false);
            }
          }
        }
      );
    });
  }

  public updateOrder(order: IOrder) {
    return this.ordersCollection
      .doc(order.id)
      .update(order)
      .then((data) => {});
  }

  public deleteOrder(orderId: string) {
    return this.ordersCollection.doc(orderId).delete();
  }
}
