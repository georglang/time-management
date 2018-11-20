import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/database';

import { IOrder } from './../data-classes/order';
import { config } from './../firebase-credentials/FirebaseCredentials.js';
import { TimeRecord } from '../data-classes/time-record';

@Injectable({
  providedIn: 'root'
})
export class CloudFirestoreService {
  private firestoreDB;
  constructor() {
    this.initialize();
    this.firestoreDB = firebase.firestore();
    this.firestoreDB.settings({ timestampsInSnapshots: true });
  }

  public initialize() {
    firebase.initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId
    });
  }

  public addOrder(order: IOrder) {
    this.firestoreDB
      .collection('orders')
      .add(order)
      .then(docRef => {
        console.log('Document written with ID: ', docRef.id);
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  }

  public getOrders() {
    return this.firestoreDB
      .collection('orders')
      .get()
      .then(orders => {
        orders.forEach(order => {
          console.log('Order', order);
          console.log(order.id, ' => ', order.data());
          console.log('RECORDS', order.data().records);
        });
      });
  }

  public updateRecord(orderId: string, newRecords: any) {
    const records = newRecords.map(obj => {
      return Object.assign({}, obj);
    });
    return this.firestoreDB
      .collection('orders')
      .get()
      .then(orders => {
        orders.forEach(order => {
          if (order.data().id === 1) {
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
