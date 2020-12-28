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
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class FirestoreWorkingHourService {
  private ordersCollection: AngularFirestoreCollection<IOrder>;
  private workingHoursCollection: AngularFirestoreCollection<IWorkingHour>;

  constructor(private afs: AngularFirestore) {
    this.ordersCollection = this.afs.collection<IOrder>('orders');
    this.workingHoursCollection = this.afs.collection<IWorkingHour>(
      'workingHours'
    );
  }

  documentToDomainObject = (dToDO) => {
    const object = dToDO.payload.doc.data();
    object.id = dToDO.payload.doc.id;
    return object;
  };

  public addWorkingHour(workingHour: IWorkingHour) {
    const _workingHour = { ...workingHour };
    delete _workingHour.id;
    return this.ordersCollection
      .doc(_workingHour.orderId)
      .collection('workingHours')
      .add(_workingHour)
      .then((docReference) => {
        return docReference.id;
      })
      .catch((error) => {
        console.error('Error adding working hour: ', error);
      });
  }

  public getWorkingHoursByOrderId(orderId: string): Observable<IWorkingHour[]> {
    return this.ordersCollection
      .doc(orderId)
      .collection('workingHours')
      .snapshotChanges()
      .pipe(map((actions) => actions.map(this.documentToDomainObject)));
  }

  public getWorkingHourById(orderId): any {
    return this.ordersCollection
      .doc(orderId)
      .collection('workingHours')
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

  public checkIfWorkingHourExistsInOrderInFirestore(
    workingHour: IWorkingHour
  ): Promise<boolean> {
    let doesWorkingHourExist = true;
    return new Promise((resolve, reject) => {
      this.getWorkingHoursFromWorkingHoursCollectionTest(
        workingHour.orderId
      ).then((workingHours: any) => {
        if (workingHours.length > 0) {
          if (this.compareIfWorkingHourIsOnline(workingHour, workingHours)) {
            doesWorkingHourExist = true;
          } else {
            doesWorkingHourExist = false;
          }
        } else {
          doesWorkingHourExist = false;
        }
        resolve(doesWorkingHourExist);
      });
      resolve(false);
    });
  }

  public getWorkingHoursFromWorkingHoursCollection() {
    const workingHours: DocumentData[] = [];
    return this.workingHoursCollection.ref.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data() as WorkingHour;
        workingHours.push(data);
      });
      return workingHours;
    });
  }

  public getWorkingHoursFromWorkingHoursCollectionTest(orderId): Promise<any> {
    const workingHours: IWorkingHour[] = [];
    return new Promise((resolve, reject) => {
      this.workingHoursCollection.ref.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data() as WorkingHour;
          if (data.orderId === orderId) {
            workingHours.push(data);
          }
        });
        resolve(workingHours);
      });
    });
  }

  public updateWorkingHour(orderId: string, workingHour: IWorkingHour) {
    const _workingHour = { ...workingHour };

    return this.ordersCollection
      .doc(orderId)
      .collection('workingHours')
      .doc(_workingHour.id)
      .update(_workingHour)
      .then(() => {});
  }

  public deleteWorkingHours(orderId: string, id) {
    return this.ordersCollection
      .doc(orderId)
      .collection('workingHours')
      .doc(id)
      .delete();
  }

  private compareIfWorkingHourIsOnline(
    workingHour: IWorkingHour,
    workingHours
  ): boolean {
    let isWorkingHourAlreadyOnline = false;
    const workingHourToCompare: IWorkingHour = Object();
    Object.assign(workingHourToCompare, workingHour);
    delete workingHourToCompare.id;
    workingHours.forEach((workingHourOnline) => {
      delete workingHourOnline.id;
      if (_.isEqual(workingHourOnline, workingHourToCompare)) {
        isWorkingHourAlreadyOnline = true;
        return;
      }
    });
    return isWorkingHourAlreadyOnline;
  }
}
