import { Injectable } from '@angular/core';
// import * as firebase from 'firebase';
// import 'firebase/firestore';
// import 'firebase/database';

import { IOrder } from './../data-classes/order';
import { config } from './../firebase-credentials/FirebaseCredentials.js';
import { TimeRecord } from '../data-classes/time-record';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CloudFirestoreService {
  private firestoreDB;
  private ordersCollectionReference: AngularFirestoreCollection<IOrder>;
  private orders: Observable<IOrder[]>;

  private data: any;
  constructor(private ngFirestore: AngularFirestore) {
    this.ordersCollectionReference = this.ngFirestore.collection<IOrder>('orders');
    this.orders = this.ordersCollectionReference.valueChanges();

    this.ordersCollectionReference.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as IOrder;
          const id = a.payload.doc.id;

          console.log(id, '=>', data);
          this.data = data;
          return { id, ...data };
        })
      )
    );

    // this.initialize();
    // this.firestoreDB = firebase.firestore();
    // this.firestoreDB.settings({ timestampsInSnapshots: true });
  }

  ngOnInit(): void {
    console.log('test', this.ordersCollectionReference.valueChanges());
  }

  // public initialize() {
  //   firebase.initializeApp({
  //     apiKey: config.apiKey,
  //     authDomain: config.authDomain,
  //     projectId: config.projectId
  //   });
  // }

  public addOrder(order: IOrder) {
    return this.ordersCollectionReference
      .add(order)
      .then(docReference => {
        return docReference.id;
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });

    // this.firestoreDB
    //   .collection('orders')
    //   .add(order)
    //   .then(docRef => {
    //     console.log('Document written with ID: ', docRef.id);
    //   })
    //   .catch(error => {
    //     console.error('Error adding document: ', error);
    //   });
  }

  // public getOrders() {
  //   return this.firestoreDB
  //     .collection('orders')
  //     .get()
  //     .then(orders => {
  //       return orders;
  //     });
  // }

  public getOrders() {
    this.orders = this.ordersCollectionReference
      .snapshotChanges()
      .pipe(map(actions => actions.map(this.documentToDomainObject)));

    return this.orders;
    return this.ordersCollectionReference.valueChanges();
  }

  documentToDomainObject = _ => {
    const object = _.payload.doc.data();
    object.id = _.payload.doc.id;
    return object;
  };

  public updateRecord(orderId: string, newRecords: any) {
    const records = newRecords.map(obj => {
      return Object.assign({}, obj);
    });
    return this.firestoreDB
      .collection('orders')
      .get()
      .then(orders => {
        orders.forEach(order => {
          if (order.data().id === orderId) {
            const orderRef = this.firestoreDB.collection('orders').doc(order.id);
            orderRef.update({
              records: records
            });
            return order;
          }
        });
      });
  }
}
