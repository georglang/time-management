import { Injectable } from '@angular/core';
import { Database } from './../database/Database';
import { TimeRecord } from '../data-classes/time-record';
import { IOrder } from '../data-classes/order';

@Injectable()
export class IndexDBService {
  private records;
  public isAlreadyInDB: boolean;

  constructor(private timeRecordsDb: Database) {
    this.isAlreadyInDB = false;
  }

  public getRecordId() {}

  public createUniqueId() {
    const ID = () => {
      const array = new Uint32Array(8);
      window.crypto.getRandomValues(array);
      let str = '';
      for (let i = 0; i < array.length; i++) {
        str += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4);
      }
      return str;
    };
    return ID();
  }

  public addRecordToOrder(record, orderId) {
    this.timeRecordsDb.orders
      .where('id')
      .equals(orderId)
      .toArray(orders => {
        if (orders !== undefined) {
          const records = orders[0].records;
          if (records.length === 0) {
            this.timeRecordsDb.orders
              .where('id')
              .equals(orderId)
              .modify(order => {
                if (order !== undefined) {
                  order.records.push(record);
                }
              });
          } else {
            for (let i = 0; i < records.length; i++) {
              if (record.id === records[i].id) {
                this.isAlreadyInDB = true;
              }
            }
            if (!this.isAlreadyInDB) {
              this.timeRecordsDb.orders
                .where('id')
                .equals(orderId)
                .modify(order => {
                  order.records.push(record);
                });
            }
          }
        }
      });
  }

  public addOrder(order) {
    return this.timeRecordsDb.orders.add(order);
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

  public getOrderById(paramId: number) {
    return this.timeRecordsDb.orders
      .where('id')
      .equals(paramId)
      .toArray(order => {
        return order;
      });
  }

  public deleteRecord(recordId, orderId) {
    return this.timeRecordsDb.orders
      .where('id')
      .equals(orderId)
      .toArray(order => {
        const records: TimeRecord[] = order[0].records;
        for (let index = 0; index < records.length; index++) {
          const element = records[index];
          if (element.id === recordId) {
            records.splice(index, 1);
            this.timeRecordsDb.orders
              .where('id')
              .equals(orderId)
              .modify(_order => {
                _order.records = records;
              });
          }
        }
      });
  }

  public update(id, data) {
    // return this.table.update(id, data);
  }

  public remove(id) {
    // return this.table.delete(id);
  }
}
