import Dexie from 'dexie';
import relationships from 'dexie-relationships';
import { ITimeRecord } from '../data-classes/ITimeRecords';
import { IOrder } from '../data-classes/Order';

export class Database extends Dexie {
  public orders: Dexie.Table<IOrder, 'string'>;
  public ordersOutbox: Dexie.Table<IOrder, 'string'>;
  public recordsOutbox: Dexie.Table<ITimeRecord, 'string'>;

  constructor() {
    super('TimeRecords', { addons: [relationships] });
    this.version(1).stores({
      orders: '++id, companyName, location, contactPerson, records',
      ordersOutbox: '++id, companyName, location, contactPerson, records',
      recordsOutbox: '++id, orderId, date, description, workingHours'
    });
  }
}
