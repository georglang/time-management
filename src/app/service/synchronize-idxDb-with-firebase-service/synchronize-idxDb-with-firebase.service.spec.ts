import { TestBed } from '@angular/core/testing';

import { SynchronizeWithFirebaseService } from './synchronize-idxDb-with-firebase.service';

describe('SynchronizationServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SynchronizeWithFirebaseService = TestBed.get(SynchronizeWithFirebaseService);
    expect(service).toBeTruthy();
  });
});
