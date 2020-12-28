import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentData,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IOrder } from '../../order/Order';
import { INote, Note } from '../Note';

@Injectable({
  providedIn: 'root',
})
export class FirestoreNoteService {
  private ordersCollection: AngularFirestoreCollection<IOrder>;
  private notesCollection: AngularFirestoreCollection<INote>;

  constructor(private afs: AngularFirestore) {
    this.ordersCollection = this.afs.collection<IOrder>('orders');
    this.notesCollection = this.afs.collection<INote>('note');
  }

  documentToDomainObject = (dToDO) => {
    const object = dToDO.payload.doc.data();
    object.id = dToDO.payload.doc.id;
    return object;
  };

  public addNote(note: INote) {
    const _note = { ...note };
    return this.ordersCollection
      .doc(_note.orderId)
      .collection('notes')
      .add(_note)
      .then((docReference) => {
        return docReference.id;
      })
      .catch((error) => {
        console.error('Error adding note: ', error);
      });
  }

  public getNotesByOrderId(orderId: string): Observable<INote[]> {
    return this.ordersCollection
      .doc(orderId)
      .collection('notes')
      .snapshotChanges()
      .pipe(map((actions) => actions.map(this.documentToDomainObject)));
  }

  public getNoteById(orderId): any {
    return this.ordersCollection
      .doc(orderId)
      .collection('notes')
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

  public getNotesFromNotesCollection() {
    const notes: DocumentData[] = [];
    return this.notesCollection.ref.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Note;
        notes.push(data);
      });
      return notes;
    });
  }

  public getNotesFromNotesCollectionTest(orderId): Promise<any> {
    const notes: INote[] = [];
    return new Promise((resolve, reject) => {
      this.notesCollection.ref.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Note;
          if (data.orderId === orderId) {
            notes.push(data);
          }
        });
        resolve(notes);
      });
    });
  }

  public updateNote(orderId: string, note: INote) {
    const _note = { ...note };

    return this.ordersCollection
      .doc(orderId)
      .collection('notes')
      .doc(_note.id)
      .update(_note)
      .then(() => {});
  }

  public deleteNote(orderId: string, noteId) {
    return this.ordersCollection
      .doc(orderId)
      .collection('notes')
      .doc(noteId)
      .delete();
  }
}
