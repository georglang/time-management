import { TestBed } from '@angular/core/testing';

import { DexieService } from './dexie.service';

describe('DexieServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DexieService = TestBed.get(DexieService);
    expect(service).toBeTruthy();
  });
});
