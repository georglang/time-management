import { TestBed } from '@angular/core/testing';

import { FirestoreOrderService } from './firestore-order.service';

describe('firestoreOrderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirestoreOrderService = TestBed.get(FirestoreOrderService);
    expect(service).toBeTruthy();
  });
});
