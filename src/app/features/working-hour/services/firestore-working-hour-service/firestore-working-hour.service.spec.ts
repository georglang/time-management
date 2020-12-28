import { TestBed } from '@angular/core/testing';

import { FirestoreWorkingHourService } from './firestore-working-hour.service';

describe('FirestoreWorkingHourService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirestoreWorkingHourService = TestBed.get(
      FirestoreWorkingHourService
    );
    expect(service).toBeTruthy();
  });
});
