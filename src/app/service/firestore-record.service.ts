import { Injectable } from '@angular/core';
import { Timestamp } from '@firebase/firestore-types';
import { TimeRecord, ITimeRecord } from '../data-classes/ITimeRecords';
import { IOrder } from '../data-classes/Order';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
  DocumentChangeAction,
  Action,
  DocumentSnapshotDoesNotExist,
  DocumentSnapshotExists,
  DocumentData
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FirestoreRecordService {
  private ordersCollection: AngularFirestoreCollection<IOrder>;
  private recordsCollection: AngularFirestoreCollection<ITimeRecord>;

  constructor(private firestore: AngularFirestore) {
    this.ordersCollection = this.firestore.collection<IOrder>('orders');
    this.recordsCollection = this.firestore.collection<ITimeRecord>('records');
  }

  documentToDomainObject = dToDO => {
    const object = dToDO.payload.doc.data();
    object.id = dToDO.payload.doc.id;
    return object;
  };

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

  // check if record is in firebase
  public checkIfRecordExistsInOrderInFirestore(
    orderId: string,
    newRecord: ITimeRecord
  ): Promise<boolean> {
    let doesRecordExist = true;
    return new Promise((resolve, reject) => {
      this.getRecordsByOrderId(orderId).subscribe((records: any) => {
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

  public getRecordsFromRecordsCollection() {
    const records: DocumentData[] = [];
    return this.recordsCollection.ref.get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        console.log(doc.data());
        records.push(doc.data());
        return doc.data();
      });
      return records;
    });
  }

  public getRecordsByOrderId(orderId: string): Observable<any> {
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
}
