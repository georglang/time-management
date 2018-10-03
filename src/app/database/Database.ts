import Dexie from 'dexie';
import { ITimeRecord, TimeRecord } from '../data-classes/time-record';

export class Database extends Dexie {
  public records: Dexie.Table<TimeRecord, number>;

  constructor() {
    super('TimeRecords');
    this.version(1).stores({
      records: '++id, customer, date, workDescription, workingHours'
    });
  }
}
