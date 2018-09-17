import { Injectable } from '@angular/core';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DexieService extends Dexie {

  constructor() {
    super('TimeRecords');
    this.version(1).stores({
      records: '++id'
    });
  }
}
