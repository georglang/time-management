import { TestBed } from '@angular/core/testing';

import { SynchronizeFirebaseWithIdxDbService } from './synchronize-firebase-with-idxDb.service';

describe('SynchronizeFirebaseWithIdxDbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SynchronizeFirebaseWithIdxDbService = TestBed.get(SynchronizeFirebaseWithIdxDbService);
    expect(service).toBeTruthy();
  });
});
