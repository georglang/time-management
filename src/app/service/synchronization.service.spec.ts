import { TestBed } from '@angular/core/testing';

import { SynchronizationService } from './synchronization.service';

describe('SynchronizationServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SynchronizationService = TestBed.get(SynchronizationService);
    expect(service).toBeTruthy();
  });
});
