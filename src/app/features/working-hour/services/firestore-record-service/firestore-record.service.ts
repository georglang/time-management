import { Injectable } from '@angular/core';
import { WorkingHour, IWorkingHour } from '../../WorkingHour';
import { IOrder } from '../../../order/Order';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentData,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import _ from 'src/app/features/material/services/firestore-material-service/node_modules/lodash';

@Injectable({
  providedIn: 'root',
})
export class FirestoreRecordService {
  private ordersCollection: AngularFirestoreCollection<IOrder>;
  private recordsCollection: AngularFirestoreCollection<IWorkingHour>;

  constructor(private afs: AngularFirestore) {
    this.ordersCollection = this.afs.collection<IOrder>('orders');
    this.recordsCollection = this.afs.collection<IWorkingHour>('records');
  }

  documentToDomainObject = (dToDO) => {
    const object = dToDO.payload.doc.data();
    object.id = dToDO.payload.doc.id;
    return object;
  };

  public addTimeRecord(record: IWorkingHour) {
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

  public getRecordsByOrderId(orderId: string): Observable<IWorkingHour[]> {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .snapshotChanges()
      .pipe(map((actions) => actions.map(this.documentToDomainObject)));
  }

  public getRecordById(orderId): any {
    return this.ordersCollection
      .doc(orderId)
      .collection('records')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

  public checkIfRecordExistsInOrderInFirestore(
    record: IWorkingHour
  ): Promise<boolean> {
    let doesRecordExist = true;
    return new Promise((resolve, reject) => {
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
        const data = doc.data() as WorkingHour;
        records.push(data);
      });
      return records;
    });
  }

  public getRecordsFromRecordsCollectionTest(orderId): Promise<any> {
    const records: IWorkingHour[] = [];
    return new Promise((resolve, reject) => {
      this.recordsCollection.ref.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data() as WorkingHour;
          if (data.orderId === orderId) {
            records.push(data);
          }
        });
        resolve(records);
      });
    });
  }

  public updateRecord(orderId: string, record: IWorkingHour) {
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

  private compareIfRecordIsOnline(newRecord: IWorkingHour, records): boolean {
    let isRecordAlreadyOnline = false;
    const recordToCompare: IWorkingHour = Object();
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
