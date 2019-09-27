import { Injectable } from '@angular/core';
import { Timestamp } from '@firebase/firestore-types';
import { TimeRecord, ITimeRecord } from '../../data-classes/TimeRecords';
import { IOrder } from '../../data-classes/Order';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentData
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import _ from 'lodash';
import { resolve } from 'q';

@Injectable({
  providedIn: 'root'
})
export class FirestoreRecordService {
  private ordersCollection: AngularFirestoreCollection<IOrder>;
  private recordsCollection: AngularFirestoreCollection<ITimeRecord>;
  constructor(private afs: AngularFirestore) {
    this.ordersCollection = this.afs.collection<IOrder>('orders');
    this.recordsCollection = this.afs.collection<ITimeRecord>('records');
  }

  documentToDomainObject = dToDO => {
    const object = dToDO.payload.doc.data();
    object.id = dToDO.payload.doc.id;
    return object;
  };

  public addTimeRecord(record: ITimeRecord) {
    const _record = JSON.parse(JSON.stringify(record));
    return this.ordersCollection
      .doc(_record.orderId)
      .collection('records')
      .add(_record)
      .then(docReference => {
        return docReference.id;
      })
      .catch(error => {
        console.error('Error adding record: ', error);
      });
  }

  // check if record is in firebase
  public checkIfRecordExistsInOrderInFirestore(record: ITimeRecord): Promise<boolean> {
    let doesRecordExist = true;
    return new Promise((resolve, reject) => {
      // Funktioniert nicht wegen
      this.getRecordsFromRecordsCollectionTest(record.orderId).then((records: any) => {
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
      });
      resolve(false);
    });
  }

  // public getRecordsFromRecordsCollection() {
  //   const records: DocumentData[] = [];
  //   return this.recordsCollection.ref.get().then(querySnapshot => {
  //     querySnapshot.forEach(doc => {
  //       console.log(doc.data());
  //       records.push(doc.data());
  //       return doc.data();
  //     });
  //     return records;
  //   });
  // }

  public getRecordsFromRecordsCollection() {
    const records: DocumentData[] = [];
    return this.recordsCollection.ref.get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const data = doc.data() as TimeRecord;
        const timestamp: any = data.date;
        data.date = (timestamp as Timestamp).toDate();
        records.push(data);
      });
      return records;
    });
  }

  public getRecordsFromRecordsCollectionTest(orderId): Promise<any> {
    const records: ITimeRecord[] = [];
    return new Promise((resolve, reject) => {
      this.recordsCollection.ref.get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const data = doc.data() as TimeRecord;
          const timestamp: any = data.date;
          data.date = (timestamp as Timestamp).toDate();
          if (data.orderId === orderId) {
            records.push(data);
          }
          console.log('RRRRRecords ', records);
        });
        resolve(records);
      });
    });
  }

  public getRecordsByOrderId(orderId: string): Observable<ITimeRecord[]> {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .snapshotChanges()
      .pipe(map(actions => actions.map(this.documentToDomainObject)));
  }

  // public getRecordsByOrderId() {
  //   this.recordsCollection.snapshotChanges().pipe(
  //     map(actions =>
  //       actions.map(a => {
  //         const data = a.payload.doc.data() as any;
  //         const id = a.payload.doc.id;
  //         return { id, ...data };
  //       })
  //     )
  //   );
  // }

  getRecordById(orderId) {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as TimeRecord;
            const timestamp: any = data.date;
            data.date = (timestamp as Timestamp).toDate();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
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
      delete recordOnline.id;
      if (_.isEqual(recordOnline, recordToCompare)) {
        isRecordAlreadyOnline = true;
        return;
      }
    });
    return isRecordAlreadyOnline;
  }
}
