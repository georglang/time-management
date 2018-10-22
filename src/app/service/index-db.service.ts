import { Injectable } from '@angular/core';
import { Database } from './../database/Database';
import { TimeRecord } from '../data-classes/time-record';
import { Order } from '../data-classes/order';

@Injectable()
export class IndexDBService {
  private records;
  private isAlreadyInDB;

  constructor(private timeRecordsDb: Database) {
    this.isAlreadyInDB = false;
  }

  // public addRecordToOrder(record, orderId) {
  //     return this.timeRecordsDb.records
  //       .add(record)
  //       .then((data) => {
  //         console.log('DAta', data);
  //         this.timeRecordsDb.orders
  //           .where('id')
  //           .equals(orderId)
  //           .modify((order) => {
  //             record.id = data;
  //             if (!order.hasOwnProperty('records')) {
  //               order.records = [];
  //             }
  //             order.records.push(record);
  //           });
  //       });
  //   }

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
    if (record.id === undefined) {
      record.id = this.createUniqueId();
    }

    this.timeRecordsDb.orders
      .where('id')
      .equals(orderId)
      .modify(order => {
        if (!order.hasOwnProperty('records')) {
          order.records = [];
          order.records.push(record);
        } else {
          order.records.forEach(recordInDB => {
            if (record.id === recordInDB.id) {
              this.isAlreadyInDB = true;
            }
          });

          console.log('ISALREADY', this.isAlreadyInDB);


          if (!this.isAlreadyInDB) {
            this.records.push(record);
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

  public removeRecord(recordId) {
    console.log('RecordsId', recordId);

    return this.timeRecordsDb.records
      .where('id')
      .equals(recordId)
      .delete();
  }

  public update(id, data) {
    // return this.table.update(id, data);
  }

  public remove(id) {
    // return this.table.delete(id);
  }
}
