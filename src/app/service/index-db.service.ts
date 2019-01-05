import { Injectable } from '@angular/core';
import { Database } from './../database/Database';
import { TimeRecord } from '../data-classes/time-record';
import _ from 'lodash';
import { IOrder } from '../data-classes/order';
import { CloudFirestoreService } from './cloud-firestore.service';

@Injectable()
export class IndexDBService {
  public isAlreadyInDB: boolean;

  constructor(private timeRecordsDb: Database, private cloudFirestore: CloudFirestoreService) {
    this.isAlreadyInDB = false;
  }

  private isConnected() {
    return navigator.onLine;
  }

  public addRecordToOrder(record, orderId) {
    return this.timeRecordsDb.orders
      .where('id')
      .equals(orderId)
      .toArray(orders => {
        if (orders !== undefined) {
          const records = orders[0].records;
          // if order has no record
          if (records === undefined) {
            orders[0].records = [];
          }
          orders[0].records.push(record);
          this.timeRecordsDb.orders
            .where('id')
            .equals(orderId)
            .modify(orders[0]);
        }
      });
  }

  public addRecordToOutboxOrder(record, orderId) {
    return this.timeRecordsDb.outboxForOrders
      .where('id')
      .equals(orderId)
      .toArray(orders => {
        if (orders !== undefined) {
          const records = orders[0].records;
          if (records === undefined) {
            orders[0].records = [];
            orders[0].records.push(record);
          } else {
            if (record.id === undefined) {
              orders[0].records.push(record);
            }



            for (let i = 0; i < records.length; i++) {
              if (record.id === records[i].id) {
                this.isAlreadyInDB = true;
              }
            }
            if (!this.isAlreadyInDB) {
              orders[0].records.push(record);
            }
          }
          this.cloudFirestore.updateRecord(orderId, orders[0].records);
        }
      });
  }

  public getOrderByIdFromOutbox(paramId: number) {
    return this.timeRecordsDb.outboxForOrders
      .where('id')
      .equals(paramId)
      .toArray(order => {
        return order;
      });
  }

  // add record to table orders
  public addOrder(order) {
    return this.timeRecordsDb.orders.add(order).then(data => {
      return data;
    });
  }

  // add record to orderOutbox
  public addOrderToOutbox(order: IOrder) {
    this.timeRecordsDb.outboxForOrders.add(order).then(data => {});
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

  public getOrdersFromOutbox(): Promise<any> {
    return this.timeRecordsDb.outboxForOrders
      .toArray()
      .then(orders => {
        return orders;
      })
      .catch(e => {
        console.error('indexedDB: can´t get orders form outbox');
      });
  }

  public getRecordById(orderId: string, recordId: string): Promise<any> {
    return this.getAllRecords(orderId);
  }

  public getOrderById(paramId: string) {
    return this.timeRecordsDb.orders
      .where('id')
      .equals(paramId)
      .toArray(order => {
        return order;
      });
  }

  public deleteOrderFromOutbox(orderId: string) {
    return this.timeRecordsDb.outboxForOrders
      .where('id')
      .equals(orderId)
      .delete()
      .then(function(deleteCount) {
        console.log('Deleted' + deleteCount + 'objects');
      });
  }

  // public modifyOrder(orderId, record) {
  //   return this.timeRecordsDb.orders
  //     .where('id')
  //     .equals(orderId)
  //     .toArray(order => {
  //       const records = order[0].records;
  //       if (records.length === 0) {
  //         order[0].records.push(record);
  //       }
  //       for (let index = 0; index < records.length; index++) {
  //         const element = records[index];
  //         if (record.id === element.id) {
  //           if (!_.isEqual(record, element)) {
  //             records.splice(index, 1);
  //             order[0].records.push(record);
  //             this.timeRecordsDb.orders
  //               .where('id')
  //               .equals(orderId)
  //               .modify((value, ref) => {
  //                 ref.value.records = records;
  //               });
  //           }
  //         }
  //       }
  //     });
  // }

  // public deleteRecord(orderId, recordId) {
  //   return this.timeRecordsDb.orders
  //     .where('id')
  //     .equals(orderId)
  //     .toArray(order => {
  //       const records: TimeRecord[] = order[0].records;
  //       for (let index = 0; index < records.length; index++) {
  //         const element = records[index];
  //         if (element.id === recordId) {
  //           records.splice(index, 1);
  //           this.timeRecordsDb.orders
  //             .where('id')
  //             .equals(orderId)
  //             .modify(_order => {
  //               _order.records = records;
  //               this.cloudFirestore.updateRecord(orderId, _order.records);
  //             });
  //         }
  //       }
  //     });
  // }

  public getAllRecords(orderId) {
    return this.timeRecordsDb.orders
      .where('id')
      .equals(orderId)
      .toArray(order => {
        if (order.length !== 0) {
          const records: TimeRecord[] = order[0].records;
          return records;
        }
      });
  }

  // public updateRecord(updatedRecord: TimeRecord, orderId: string) {
  //   return this.timeRecordsDb.orders
  //     .where('id')
  //     .equals(orderId)
  //     .toArray(order => {
  //       const records = order[0].records;
  //       for (let index = 0; index < records.length; index++) {
  //         const element = records[index];
  //         if (updatedRecord.id === element.id) {
  //           if (!_.isEqual(updatedRecord, element)) {
  //             records.splice(index, 1);
  //             order[0].records.push(updatedRecord);
  //             this.timeRecordsDb.orders
  //               .where('id')
  //               .equals(orderId)
  //               .modify((value, ref) => {
  //                 ref.value.records = records;

  //                 this.cloudFirestore
  //                   .updateRecord(orderId.toString(), order[0].records);
  //                   .then(data => {
  //                     console.log('Updated in firestore');
  //                   });
  //               });
  //           }
  //         }
  //       }
  //     });
  // }
}
