import { Injectable } from '@angular/core';
import { TimeRecord, ITimeRecord } from '../../data-classes/TimeRecords';
import { IOrder } from '../../data-classes/Order';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentData,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class FirestoreRecordService {
  private ordersCollection: AngularFirestoreCollection<IOrder>;
  private recordsCollection: AngularFirestoreCollection<ITimeRecord>;

  constructor(private afs: AngularFirestore) {
    this.ordersCollection = this.afs.collection<IOrder>('orders');
    this.recordsCollection = this.afs.collection<ITimeRecord>('records');
  }

  documentToDomainObject = (dToDO) => {
    const object = dToDO.payload.doc.data();
    object.id = dToDO.payload.doc.id;
    return object;
  };

  public addTimeRecord(record: ITimeRecord) {
    const _record = { ...record };
    delete _record.id;
    return this.ordersCollection
      .doc(_record.orderId)
      .collection('records')
      .add(_record)
      .then((docReference) => {
        return docReference.id;
      })
      .catch((error) => {
        console.error('Error adding record: ', error);
      });
  }

  public getRecordsByOrderId(orderId: string) {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .valueChanges({ idField: 'id' });
  }

  public getRecordById(orderId) {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .valueChanges({ idField: 'id' });
  }

  // check if record is in firebase
  public checkIfRecordExistsInOrderInFirestore(
    record: ITimeRecord
  ): Promise<boolean> {
    let doesRecordExist = true;
    return new Promise((resolve, reject) => {
      // Funktioniert nicht wegen
      this.getRecordsFromRecordsCollectionTest(record.orderId).then(
        (records: any) => {
          if (records.length > 0) {
            if (this.compareIfRecordIsOnline(record, records)) {
              doesRecordExist = true;
            } else {
              doesRecordExist = false;
            }
          } else {
            doesRecordExist = false;
          }
          resolve(doesRecordExist);
        }
      );
      resolve(false);
    });
  }

  public getRecordsFromRecordsCollection() {
    const records: DocumentData[] = [];
    return this.recordsCollection.ref.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data() as TimeRecord;
        records.push(data);
      });
      return records;
    });
  }

  public getRecordsFromRecordsCollectionTest(orderId): Promise<any> {
    const records: ITimeRecord[] = [];
    return new Promise((resolve, reject) => {
      this.recordsCollection.ref.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data() as TimeRecord;
          if (data.orderId === orderId) {
            records.push(data);
          }
          console.log('RRRRRecords ', records);
        });
        resolve(records);
      });
    });
  }

  public updateRecord(orderId: string, record: ITimeRecord) {
    const _record = { ...record };

    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .doc(_record.id)
      .update(_record)
      .then(() => {});
  }

  public deleteRecord(orderId: string, recordId) {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .doc(recordId)
      .delete();
  }

  private compareIfRecordIsOnline(newRecord: ITimeRecord, records): boolean {
    let isRecordAlreadyOnline = false;
    const recordToCompare: ITimeRecord = Object();
    Object.assign(recordToCompare, newRecord);
    delete recordToCompare.id;
    records.forEach((recordOnline) => {
      delete recordOnline.id;
      if (_.isEqual(recordOnline, recordToCompare)) {
        isRecordAlreadyOnline = true;
        return;
      }
    });
    return isRecordAlreadyOnline;
  }
}
