import { Injectable } from '@angular/core';
import { Database } from './../database/Database';
import { TimeRecord } from '../data-classes/time-record';
import { Order } from '../data-classes/order';

@Injectable()
export class IndexDBService {
  constructor(private timeRecordsDb: Database) {}

  public insertOneRecord() {
    const record = new TimeRecord('Lang', '20.20.20', 'Arbeit', 10.0, 'Wolfskopf');
    this.timeRecordsDb.records.add(record).then(() => {
      return this.timeRecordsDb.records.where('workingHours').below(20).toArray;
    });
  }

  insertOneOrder() {
    const order = new Order('Lang', '20.20.20', 'Arbeit');
    this.timeRecordsDb.orders.add(order).then(data => {
      return data;
    });
  }

  public getAllRecords(): Promise<any> {
    return this.timeRecordsDb.records
      .toArray()
      .then(result => {
        return result;
      })
      .catch(e => {
        console.error('IndexDB getAllRecords: ', e);
      });
  }

  public addRecord(record) {
    return this.timeRecordsDb.records
      .add(record)
      .then(result => {})
      .catch(e => {
        console.error('IndexDB addRecord: ', e);
      });
  }

  public addOrder(order) {
    order['records'] = [];
    this.timeRecordsDb.orders.add(order)
    .catch(e => {
      console.error('IndexDB addOrder: ', e);
    });
  }

  public getAllOrders(): Promise<any> {
    return this.timeRecordsDb.orders
      .toArray()
      .then(result => {
        return result;
      })
      .catch(e => {
        console.error('IndexDB getAllOrders: ', e);
      });
  }

  public update(id, data) {
    // return this.table.update(id, data);
  }

  public remove(id) {
    // return this.table.delete(id);
  }
}
