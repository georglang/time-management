import { Injectable } from '@angular/core';
import { Database } from '../database/Database';
import { TimeRecord, ITimeRecord } from '../data-classes/time-record';
import _ from 'lodash';
import { IOrder } from '../data-classes/Order';
import { CloudFirestoreService } from './cloudFirestore.service';

@Injectable()
export class IndexedDBService {
  public isAlreadyInDB: boolean;

  constructor(private timeRecordsDb: Database, private cloudFirestore: CloudFirestoreService) {
    this.isAlreadyInDB = false;
  }

  // ToDo: schauen, ob check methoden vereinfacht werden koennen, ohne extra array

  // check if order is in indexedDB ordersOutbox
  public checkIfOrderIsInIndexedDBOrdersOutboxTable(order): Promise<boolean> {
    let isAlreadyInOrdersOutboxTable = true;
    const orders = [];

    return new Promise((resolve, reject) => {
      this.getOrdersFromOutbox().then(ordersInOutbox => {
        if (ordersInOutbox !== undefined) {
          if (ordersInOutbox.length !== 0) {
            const newOrder = {
              companyName: order.companyName,
              location: order.location,
              contactPerson: order.contactPerson
            };

            ordersInOutbox.forEach(orderInOutbox => {
              orders.push({
                companyName: orderInOutbox.companyName,
                location: orderInOutbox.location,
                contactPerson: orderInOutbox.contactPerson
              });
            });
            isAlreadyInOrdersOutboxTable = _.findIndex(orders, o => _.isMatch(o, newOrder)) > -1;
            resolve(isAlreadyInOrdersOutboxTable);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  // check if order is in indexedDB orders table
  public checkIfOrderIsIndexedDBOrdersTable(order): Promise<boolean> {
    let isAlreadyInOrdersTable = true;
    return new Promise((resolve, reject) => {
      this.getOrdersFromOrdersTable().then(_orders => {
        if (_orders !== undefined) {
          if (_orders.length !== 0) {
            const orders = [];
            const newOrder = {
              companyName: order.companyName,
              location: order.location,
              contactPerson: order.contactPerson
            };

            _orders.forEach(orderInOutbox => {
              orders.push({
                companyName: orderInOutbox.companyName,
                location: orderInOutbox.location,
                contactPerson: orderInOutbox.contactPerson
              });
            });

            isAlreadyInOrdersTable = _.findIndex(orders, o => _.isMatch(o, newOrder)) > -1;
            resolve(isAlreadyInOrdersTable);
          } else {
            isAlreadyInOrdersTable = false;
            resolve(isAlreadyInOrdersTable);
          }
        }
      });
    });
  }

  // check if record is in indexedDB orders table
  public checkIfRecordIsInOrdersTable(record: ITimeRecord, orderId: string) {
    let isAlreadyInRecordsTable = true;
    return new Promise((resolve, reject) => {
      this.getAllRecords(orderId).then(recordsInIdxDB => {
        if (recordsInIdxDB !== undefined) {
          if (recordsInIdxDB.length !== 0) {
            const _records = [];
            const newRecord = {
              date: record.date,
              description: record.description,
              workingHours: record.workingHours
            };

            recordsInIdxDB.forEach(recordIdxDB => {
              _records.push({
                date: recordIdxDB.date,
                description: recordIdxDB.description,
                workingHours: recordIdxDB.workingHours
              });
            });

            isAlreadyInRecordsTable = _.findIndex(_records, o => _.isMatch(o, newRecord)) > -1;
            resolve(isAlreadyInRecordsTable);
          } else {
            isAlreadyInRecordsTable = false;
            resolve(isAlreadyInRecordsTable);
          }
        }
      });
    });
  }

  // add order offline
  public addOrderToOutbox(order: IOrder) {
    return this.timeRecordsDb.ordersOutbox.add(order).then(data => {
      console.log('Data', data);
      return data;
    });
  }

  // delete order in indexedDb ordersOutbox
  public deleteOrderInOutbox(orderId) {
    this.deleteOrderInOrdersOutbox(orderId).then(() => {});
  }

  // evtl. noch createdAt mit einbeziehen, damit keine doppelten eintraege vorhanden sind
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

  public addRecordToOrderOutbox(record, orderId) {
    return this.timeRecordsDb.ordersOutbox
      .where('id')
      .equals(+orderId)
      .first()
      .then(data => {
        data.records.push(record);
        console.log('Data', data);
        this.timeRecordsDb.ordersOutbox
          .where('id')
          .equals(+orderId)
          .modify(data)
          .then(updated => {
            console.log('Data', updated);
          })
          .catch(e => {
            console.warn('indexedDB: can´t add record to order in outbox');
          });
      });
  }

  public getOrderByIdFromOutbox(paramId: number) {
    return this.timeRecordsDb.ordersOutbox
      .where('id')
      .equals(paramId)
      .toArray(order => {
        return order;
      });
  }

  // add record to table orders
  public addToOrdersTable(order) {
    return this.timeRecordsDb.orders.add(order).then(data => {
      return data;
    });
  }

  public getOrdersFromOrdersTable(): Promise<any> {
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
    return this.timeRecordsDb.ordersOutbox
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

  public deleteOrderInOrdersOutbox(orderId: string) {
    return this.timeRecordsDb.ordersOutbox
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

  public getAllRecords(orderId): Promise<ITimeRecord[]> {
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
