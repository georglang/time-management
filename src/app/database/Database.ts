import Dexie from 'dexie';
import relationships from 'dexie-relationships';
import { ITimeRecord } from '../data-classes/time-record';
import { IOrder } from '../data-classes/order';

export class Database extends Dexie {
  public records: Dexie.Table<ITimeRecord, 'string'>;
  public orders: Dexie.Table<IOrder, 'string'>;

  constructor() {
    super('TimeRecords', { addons: [relationships] });
    this.version(1).stores({
      records: '++id, date, description, workingHours',
      orders: '++id, companyName, location, contactPerson, records'
    });
  }
}
