import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/database';

import { IOrder } from './../data-classes/order';
import { config } from './../firebase-credentials/FirebaseCredentials.js';

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

  public getOrder() {
    return this.firestoreDB
      .collection('orders')
      .get()
      .then(orders => {
        orders.forEach(order => {
          console.log('Order', order);
          console.log(order.id, ' => ', order.data());
        });
      });
  }
}
