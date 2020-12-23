/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FirestoreNoteService } from './firestore-note.service';

describe('Service: FirestoreNote', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FirestoreNoteService]
    });
  });

  it('should ...', inject([FirestoreNoteService], (service: FirestoreNoteService) => {
    expect(service).toBeTruthy();
  }));
});
