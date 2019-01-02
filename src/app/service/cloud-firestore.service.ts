import { Injectable, OnInit } from '@angular/core';
// import * as firebase from 'firebase';
// import 'firebase/firestore';
// import 'firebase/database';

import { IOrder, Order } from './../data-classes/order';
import { config } from './../firebase-credentials/FirebaseCredentials.js';
import { TimeRecord, ITimeRecord } from '../data-classes/time-record';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  DocumentReference
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CloudFirestoreService {
  private ordersDocument: AngularFirestoreDocument<IOrder>;
  public order: Observable<IOrder>;
  private ordersCollection: AngularFirestoreCollection<IOrder>;
  private orders: Observable<IOrder[]>;
  private orderDoc: AngularFirestoreDocument<IOrder>;

  private data: any;
  constructor(private afs: AngularFirestore) {
    this.ordersDocument = afs.doc<IOrder>('orders/1');
    console.log('Orders Document', this.ordersDocument);

    this.order = this.ordersDocument.valueChanges();

    this.ordersCollection = this.afs.collection<IOrder>('orders');

    this.orders = this.ordersCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(action => {
          const data = action.payload.doc.data() as IOrder;
          const id = action.payload.doc.id;
          console.log(id, '=>', data);
          this.data = data;
          return { id, ...data };
        })
      )
    );

    this.orders.subscribe();
  }

  update(item: IOrder) {
    let test: any;
    let nestedCollection: AngularFirestoreCollection;

    this.orderDoc = this.afs.doc<IOrder>('order/');
    console.log('Order Doc', this.orderDoc);

    // access nested collection
    test = this.orderDoc.collection<ITimeRecord>('records').valueChanges();
    nestedCollection = this.orderDoc.collection<ITimeRecord>('records');
  }

  public async getCompleteData() {
    this.orders = this.ordersCollection
      .snapshotChanges()
      .pipe(map(actions => actions.map(this.documentToDomainObject)));
    return this.orders;

    return this.afs
      .collection('orders')
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            const pointRef: Observable<any> = this.afs.collection('records').valueChanges();

            const pointsObserver = pointRef.subscribe(records => {
              console.log('pointsObserver', records);

              return {};
            });
          })
        )
      );
  }

  public getOrders() {
    this.orders = this.ordersCollection
      .snapshotChanges()
      .pipe(map(actions => actions.map(this.documentToDomainObject)));
    return this.orders;
  }

  public getRecords(orderId: string) {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .snapshotChanges()
      .pipe(map(actions => actions.map(this.documentToDomainObject)));
  }

  public getRecordById(orderId: string, recordId: string) {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const object = a.payload.doc.data() as TimeRecord;
            object.id = a.payload.doc.id;
            return object;
          });
        })
      );
  }

  documentToDomainObject = _ => {
    const object = _.payload.doc.data();
    object.id = _.payload.doc.id;
    return object;
  }


  public deleteRecord(orderId: string, recordId) {
    this.ordersCollection
      .doc(orderId)
      .collection('records')
      .doc(recordId)
      .delete();
  }

  public addOrder(order: IOrder) {
    const id = this.afs.createId();
    order.id = id;

    console.log('New Order', order);

    const _order = JSON.parse(JSON.stringify(order));

    return this.ordersCollection
      .add(_order)
      .then(docReference => {
        return docReference.id;
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  }

  public addTimeRecord(orderId: string, record: ITimeRecord) {
    console.log('Record', record);

    // const recordId = this.afs.createId();
    // record.id = recordId;

    console.log('Record with id', record);

    // this.ordersCollection.doc(orderId).collection(record).stateChanges(record);
    this.ordersCollection
      .doc(orderId)
      .collection('records')
      .add(record)
      .then(data => {
        console.log('Added Record to Firestore', data.id);
        record.id = data.id;
        console.log('RRRRRECORD', record);
      });

    // documentReference = this.ordersDocument.ref.collection('orders').where('id', '==', orderId);
    // this.ordersCollection.add(record);

    // return this.ordersCollection
    //   .add(order)
    //   .then(docReference => {
    //     return docReference.id;
    //   })
    //   .catch(error => {
    //     console.error('Error adding document: ', error);
    //   });
  }

  public recordById = _ => {
    const object = _.payload.doc.data();
  };

  public updateRecord(orderId: string, newRecords: any) {
    const records = newRecords.map(obj => {
      return Object.assign({}, obj);
    });

    console.log('New Records', records);
    console.log('OrderId', orderId);
  }
}
