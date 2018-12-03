import { Injectable } from '@angular/core';
import { Database } from './../database/Database';
import { TimeRecord } from '../data-classes/time-record';
import _ from 'lodash';
import { IOrder } from '../data-classes/order';
import { CloudFirestoreService } from './cloud-firestore.service';

@Injectable()
export class IndexDBService {
  private records;
  public isAlreadyInDB: boolean;

  constructor(private timeRecordsDb: Database, private cloudFirestore: CloudFirestoreService) {
    this.isAlreadyInDB = false;
  }

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
    return this.timeRecordsDb.orders
      .where('id')
      .equals(orderId)
      .toArray(orders => {
        const records = orders[0].records;

        if (records.length === 0) {
          this.timeRecordsDb.orders
            .where('id')
            .equals(orderId)
            .modify(order => {
              order.records.push(record);
              this.cloudFirestore.updateRecord(orderId, order.records);
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
                this.cloudFirestore.updateRecord(orderId, order.records);
              });
          }
        }
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

  public getRecordById(orderId: number, recordId: string): Promise<any> {
    return this.getAllRecords(orderId);
  }

  public getOrderById(paramId: number) {
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
      .then(function (deleteCount) {
        console.log( 'Deleted' + deleteCount + 'objects');
    });

  }

  public modifyOrder(orderId, record) {
    return this.timeRecordsDb.orders
      .where('id')
      .equals(orderId)
      .toArray(order => {
        const records = order[0].records;
        for (let index = 0; index < records.length; index++) {
          const element = records[index];
          if (record.id === element.id) {
            if (!_.isEqual(record, element)) {
              records.splice(index, 1);
              order[0].records.push(record);
              this.timeRecordsDb.orders
                .where('id')
                .equals(orderId)
                .modify((value, ref) => {
                  ref.value.records = records;
                });
            }
          }
        }
      });
  }

  public deleteRecord(orderId, recordId) {
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
                this.cloudFirestore.updateRecord(orderId, _order.records);
              });
          }
        }
      });
  }

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

  public updateRecord(updatedRecord: TimeRecord, orderId: number) {
    return this.timeRecordsDb.orders
      .where('id')
      .equals(orderId)
      .toArray(order => {
        const records = order[0].records;
        for (let index = 0; index < records.length; index++) {
          const element = records[index];
          if (updatedRecord.id === element.id) {
            if (!_.isEqual(updatedRecord, element)) {
              records.splice(index, 1);
              order[0].records.push(updatedRecord);
              this.timeRecordsDb.orders
                .where('id')
                .equals(orderId)
                .modify((value, ref) => {
                  ref.value.records = records;

                  this.cloudFirestore
                    .updateRecord(orderId.toString(), order[0].records)
                    .then(data => {
                      console.log('Updated in firestore');
                    });
                });
            }
          }
        }
      });
  }
}
