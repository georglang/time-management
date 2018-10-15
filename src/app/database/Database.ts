import Dexie from 'dexie';
import { TimeRecord } from '../data-classes/time-record';
import { Order } from '../data-classes/order';

export class Database extends Dexie {
  public records: Dexie.Table<TimeRecord, number>;
  public orders: Dexie.Table<Order, number>;

  constructor() {
    super('TimeRecords');
    this.version(1).stores({
      records: '++id, date, workDescription, workingHours',
      orders: '++id, companyName, location, contactPerson, records'
    });
  }
}
