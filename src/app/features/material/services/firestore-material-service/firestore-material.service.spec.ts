/* tslint:disable:no-unused-variable */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { FirestoreMaterialService } from './firestore-material.service';

describe('Service: FirestoreMaterial', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FirestoreMaterialService]
    });
  });

  it('should ...', inject([FirestoreMaterialService], (service: FirestoreMaterialService) => {
    expect(service).toBeTruthy();
  }));
});
