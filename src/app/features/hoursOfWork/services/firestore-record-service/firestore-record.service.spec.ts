import { TestBed } from '@angular/core/testing';

import { FirestoreRecordService } from './firestore-record.service';

describe('FirestoreRecordService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirestoreRecordService = TestBed.get(FirestoreRecordService);
    expect(service).toBeTruthy();
  });
});
