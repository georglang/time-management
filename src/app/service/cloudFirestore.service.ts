import { Injectable, OnInit } from '@angular/core';
import { Timestamp } from '@firebase/firestore-types';

// import * as firebase from 'firebase';
// import 'firebase/firestore';
// import 'firebase/database';

import { IOrder, Order, IFlattenOrder } from '../data-classes/Order';
import { TimeRecord, ITimeRecord } from '../data-classes/ITimeRecords';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  DocumentChangeAction,
  DocumentReference
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class CloudFirestoreService {
  private ordersDocument: AngularFirestoreDocument<IOrder>;

  public ordersCollection: AngularFirestoreCollection<IOrder>;
  public order: Observable<IOrder[]>;

  private orders: Observable<IOrder[]>;
  private orderDoc: AngularFirestoreDocument<IOrder>;

  private ordersInFirestore: any[] = [];

  private data: any;
  constructor(private afs: AngularFirestore) {
    this.ordersDocument = afs.doc<IOrder>('orders/1');
    this.ordersCollection = this.afs.collection<IOrder>('orders');
  }

  public checkIfOrderIsInFirestore(order: IOrder): Promise<boolean> {
    let isAlreadyInFirestore = true;
    const orders: IFlattenOrder[] = []; // without id and createdAt properties

    return new Promise((resolve, reject) => {
      this.getDocumentsInOrdersCollection().then(ordersInFirestore => {
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

  // check if record is in firebase
  public checkIfRecordExistsInOrderInFirestore(
    orderId: string,
    newRecord: ITimeRecord
  ): Promise<boolean> {
    let doesRecordExist = true;
    return new Promise((resolve, reject) => {
      this.getRecords(orderId).subscribe((records: any) => {
        if (records.length > 0) {
          if (this.compareIfRecordIsOnline(newRecord, records)) {
            doesRecordExist = true;
          } else {
            doesRecordExist = false;
          }
        } else {
          doesRecordExist = false;
        }
        resolve(doesRecordExist);
      });
    });
  }

  private compareIfRecordIsOnline(newRecord: ITimeRecord, records): boolean {
    let isRecordAlreadyOnline = false;
    const recordToCompare: ITimeRecord = Object();
    Object.assign(recordToCompare, newRecord);
    delete recordToCompare.id;
    records.forEach(recordOnline => {
      delete recordOnline.createdAt;
      delete recordOnline.id;
      // convert firebase timestamp to js date
      recordOnline.date = (recordOnline['date'] as Timestamp).toDate();
      if (_.isEqual(recordOnline, recordToCompare)) {
        isRecordAlreadyOnline = true;
        return;
      }
    });
    return isRecordAlreadyOnline;
  }

  public getDocumentsInOrdersCollection() {
    return this.ordersCollection.ref.get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        console.log(doc.data());
        this.ordersInFirestore.push(doc.data());
        debugger;
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

  public getOrders() {
    return (this.orders = this.ordersCollection
      .snapshotChanges()
      .pipe(map(actions => actions.map(this.documentToDomainObject))));
  }

  public getRecords(orderId: string) {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .snapshotChanges()
      .pipe(map(actions => actions.map(this.documentToDomainObject)));
  }

  public getOrderById(orderId: string) {
    return this.ordersCollection
      .doc(orderId)
      .ref.get()
      .then(doc => {
        if (doc.exists) {
          const data: Order = Object.assign(doc.data());
          return data;
        }
      })
      .catch(function(error) {
        console.log('getOrderById: no order found', error);
      });
  }

  public getRecordById(orderId: string, recordId: string) {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .doc(recordId)
      .ref.get()
      .then(doc => {
        if (doc.exists) {
          const data: TimeRecord = Object.assign(doc.data());
          console.log('data', data);

          return data;
        }
      })
      .catch(function(error) {
        console.log('getOrderById: no order found', error);
      });
  }

  public deleteRecord(orderId: string, recordId) {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .doc(recordId)
      .delete()
      .then(data => {
        return data;
      });
  }

  public addOrder(order: IOrder) {
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

  public addTimeRecord(orderId: string, record: any) {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .add(record)
      .then(docReference => {
        return docReference.id;
      })
      .catch(error => {
        console.error('Error adding record: ', error);
      });
  }

  public updateRecord(orderId: string, newRecords: any) {
    const records = newRecords.map(obj => {
      return Object.assign({}, obj);
    });
  }
}
