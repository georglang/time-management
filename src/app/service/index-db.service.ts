import { Injectable } from '@angular/core';
import { Database } from './../database/Database';
import { TimeRecord } from '../data-classes/time-record';
import { Order } from '../data-classes/order';

@Injectable()
export class IndexDBService {
  private records;

  constructor(private timeRecordsDb: Database) {}

  public insertOneRecord() {
    // const record = new TimeRecord('Lang', '20.20.20', 10.0, 'Wolfskopf');
    // this.timeRecordsDb.records.add(record).then(() => {
    //   return this.timeRecordsDb.records.where('workingHours').below(20).toArray;
    // });
  }

  public addRecord(record) {
    // return this.timeRecordsDb.records
    //   .add(record)
    //   .then(result => {})
    //   .catch(e => {
    //     console.error('IndexDB addRecord: ', e);
    //   });
  }

  // public addRecordToOrder(record, orderId) {
  //   return this.timeRecordsDb.orders
  //     .where('id')
  //     .equals(orderId)
  //     .modify(order => order.records.push(record))
  //     .then((data) => console.log('DAta', data));
  // }

  public addRecordToOrder(record, orderId) {
      return this.timeRecordsDb.records
        .add(record)
        .then((data) => {
          console.log('DAta', data);
          this.timeRecordsDb.orders
            .where('id')
            .equals(orderId)
            .modify((order) => {
              record.id = data;
              debugger;
              order.records.push(record);
            });
        });
    }




  // public addRecordToOrder(record, orderId) {
  //   return this.timeRecordsDb.records
  //     .add(record)
  //     .then((data) => {
  //       console.log('DAta', data);
  //       this.timeRecordsDb.orders
  //         .where('id')
  //         .equals(orderId)
  //         .modify((order) => {
  //           order.recordIds.push(data);
  //         });
  //     });
  // }



  public addOrder(order) {
    order['records'] = [];
    return this.timeRecordsDb.orders.add(order);
    //   .then(data => {
    //     debugger;
    //     console.log('Record Added', data);
    //   })
    //   .catch(e => {
    //   console.error('IndexDB addOrder: ', e);
    // });
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

  public update(id, data) {
    // return this.table.update(id, data);
  }

  public remove(id) {
    // return this.table.delete(id);
  }
}
