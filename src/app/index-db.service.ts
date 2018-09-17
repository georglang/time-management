import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { TimeRecord } from './time-record';
import { DexieService } from './dexie.service';

export interface RecordWithID extends TimeRecord {
  id: number;
}
@Injectable()
export class IndexDBService {
  table: Dexie.Table<RecordWithID, number>;

  constructor(private dexieService: DexieService) {
    this.table = this.dexieService.table('records');
    console.log('Dexie Table', this.table);

  }

  public getAll() {
    return this.table.toArray();
  }

  public add(data) {
    return this.table.add(data);
  }

  public update(id, data) {
    return this.table.update(id, data);
  }

  public remove(id) {
    return this.table.delete(id);
  }
}
