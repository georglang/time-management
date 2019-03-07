import { TestBed } from '@angular/core/testing';
import { IndexedDBService } from './indexedDb.service';

describe('IndexDBService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IndexedDBService = TestBed.get(IndexedDBService);
    expect(service).toBeTruthy();
  });
});
