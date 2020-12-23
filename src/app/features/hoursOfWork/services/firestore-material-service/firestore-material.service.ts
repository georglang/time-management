import { Injectable } from '@angular/core';
import { IMaterial, Material } from '../../data-classes/Material';

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
export class FirestoreMaterialService {
  private ordersCollection: AngularFirestoreCollection<IOrder>;
  private materialCollection: AngularFirestoreCollection<IMaterial>;

  constructor(private afs: AngularFirestore) {
    this.ordersCollection = this.afs.collection<IOrder>('orders');
    this.materialCollection = this.afs.collection<IMaterial>('materials');
  }

  documentToDomainObject = (dToDO) => {
    const object = dToDO.payload.doc.data();
    object.id = dToDO.payload.doc.id;
    return object;
  };

  public addMaterial(material: IMaterial) {
    const _material = { ...material };
    return this.ordersCollection
      .doc(_material.orderId)
      .collection('materials')
      .add(_material)
      .then((docReference) => {
        return docReference.id;
      })
      .catch((error) => {
        console.error('Error adding material: ', error);
      });
  }

  public getMaterialsByOrderId(orderId: string): Observable<IMaterial[]> {
    return this.ordersCollection
      .doc(orderId)
      .collection('materials')
      .snapshotChanges()
      .pipe(map((actions) => actions.map(this.documentToDomainObject)));
  }

  public getMaterialById(orderId): any {
    return this.ordersCollection
      .doc(orderId)
      .collection('materials')
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

  public checkIfMaterialExistsInOrderInFirestore(
    material: IMaterial
  ): Promise<boolean> {
    let doesMaterialExist = true;
    return new Promise((resolve, reject) => {
      this.getMaterialsFromMaterialsCollectionTest(material.orderId).then(
        (materials: any) => {
          if (materials.length > 0) {
            if (this.compareIfMaterialIsOnline(material, materials)) {
              doesMaterialExist = true;
            } else {
              doesMaterialExist = false;
            }
          } else {
            doesMaterialExist = false;
          }
          resolve(doesMaterialExist);
        }
      );
      resolve(false);
    });
  }

  public getMaterialsFromMaterialsCollection() {
    const materials: DocumentData[] = [];
    return this.materialCollection.ref.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Material;
        materials.push(data);
      });
      return materials;
    });
  }

  public getMaterialsFromMaterialsCollectionTest(orderId): Promise<any> {
    const materials: IMaterial[] = [];
    return new Promise((resolve, reject) => {
      this.materialCollection.ref.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Material;
          if (data.orderId === orderId) {
            materials.push(data);
          }
        });
        resolve(materials);
      });
    });
  }

  public updateMaterial(orderId: string, material: IMaterial) {
    const _material = { ...material };

    return this.ordersCollection
      .doc(orderId)
      .collection('materials')
      .doc(_material.id)
      .update(_material)
      .then(() => {});
  }

  public deleteMaterial(orderId: string, materialId) {
    return this.ordersCollection
      .doc(orderId)
      .collection('materials')
      .doc(materialId)
      .delete();
  }

  private compareIfMaterialIsOnline(
    newMaterial: IMaterial,
    materials
  ): boolean {
    let isMaterialAlreadyOnline = false;
    const materialToCompare: IMaterial = Object();
    Object.assign(materialToCompare, newMaterial);
    materials.forEach((materialOnline) => {
      delete materialOnline.id;
      if (_.isEqual(materialOnline, materialToCompare)) {
        isMaterialAlreadyOnline = true;
        return;
      }
    });
    return isMaterialAlreadyOnline;
  }
}
