import { Injectable } from '@angular/core';
import { Database } from '../../database/Database';
import { TimeRecord, ITimeRecord } from '../../data-classes/ITimeRecords';
import _ from 'lodash';
import { IOrder } from '../../data-classes/Order';
import { FirestoreOrderService } from '../firestore-order-service/firestore-order.service';

@Injectable()
export class IndexedDBService {
  public isAlreadyInDB: boolean;
  private orderIds: number[] = [];

  constructor(private timeRecordsDb: Database, private cloudFirestore: FirestoreOrderService) {
    this.isAlreadyInDB = false;
  }

  // ToDo: schauen, ob check methoden vereinfacht werden koennen, ohne extra array
  // ToDo: Wenn auch Order Offline erstellt wurde, befindet sie sich in ordersOutbox
  // --> Hat dann noch keine firebase Id

  // check by id, if order is in ordersOutbox
  public checkByIdIfOrderIsInIndexedDBOrdersOutboxTable(orderId: number): Promise<boolean> {
    const orderIds: number[] = [];
    return new Promise((resolve, reject) => {
      this.getOrdersFromOrdersOutbox().then(ordersInOutbox => {
        if (ordersInOutbox !== undefined) {
          if (ordersInOutbox.length !== 0) {
            ordersInOutbox.forEach(orderInOubox => {
              orderIds.push(orderInOubox.id);
            });
            if (orderIds.includes(orderId)) {
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  // check if order is in indexedDB ordersOutbox
  public checkIfOrderIsInIndexedDBOrdersOutboxTable(order): Promise<boolean> {
    let isAlreadyInOrdersOutboxTable = true;
    const orders = [];

    return new Promise((resolve, reject) => {
      this.getOrdersFromOrdersOutbox().then(ordersInOutbox => {
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
  public checkIfOrderIsInIndexedDBOrdersTable(order): Promise<boolean> {
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

  // check if record is in recordsOutbox table
  public checkIfRecordIsInRecordsOutboxTable(record: ITimeRecord) {
    let isAlreadyInRecordsOutboxTable = true;
    return new Promise((resolve, reject) => {
      const records = [];

      this.getRecordsFromRecordsOutboxTable().then(recordsInOutbox => {
        if (recordsInOutbox !== undefined) {
          if (recordsInOutbox.length !== 0) {
            const newRecord = {
              date: record.date,
              description: record.description,
              workingHours: record.workingHours
            };

            recordsInOutbox.forEach(recordInOutbox => {
              records.push({
                date: recordInOutbox.date,
                description: recordInOutbox.description,
                workingHours: recordInOutbox.workingHours
              });
            });
            isAlreadyInRecordsOutboxTable = _.findIndex(records, o => _.isMatch(o, newRecord)) > -1;
            resolve(isAlreadyInRecordsOutboxTable);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  // check if ordersOutbox contains orders
  public doesOrdersOutboxContainOrders(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getOrdersFromOrdersOutbox().then(ordersInOrdersOutbox => {
        if (ordersInOrdersOutbox !== undefined) {
          if (ordersInOrdersOutbox.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  // check if recordsOutbox contains records
  public doesRecordsOutboxContainRecords(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getRecordsFromRecordsOutboxTable().then(recordssInRecordsOutbox => {
        if (recordssInRecordsOutbox !== undefined) {
          if (recordssInRecordsOutbox.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
  }

  public updateLocalIdOfRecordsOutboxWithFirebaseId(
    localOrderId: number,
    fbId: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getRecordsFromRecordsOutboxTable().then(records => {
        records.forEach(record => {
          if (localOrderId === +record.orderId) {
            this.timeRecordsDb.recordsOutbox
              .where('orderId')
              .equals(localOrderId.toString())
              .modify({ orderId: fbId })
              .then(updated => {
                if (updated) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              })
              .catch(e => {
                console.warn('indexedDB: can´t update orderId of record');
                resolve(false);
              });
          }
        });
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

  // check if orders are in orders table
  // if not: add order that is not in orders table yet

// Fehler beim schreiben in indexedDB ueberprufen, ob oder mit records bereits in orders Table

  public addOrderToOrdersTable(orders: IOrder[]): void {
    if (orders.length > 0) {
      orders.forEach(order => {
        this.getOrdersFromOrdersTable().then((ordersInIndexedDB: IOrder[]) => {
          if (ordersInIndexedDB !== undefined) {
            this.orderIds = [];
            ordersInIndexedDB.forEach(cachedOrder => {
              this.orderIds.push(cachedOrder.id);
            });
            orders.forEach(_order => {
              if (!this.orderIds.includes(_order.id)) {
                debugger;
                this.addToOrdersTable(order);
              }
            });
          }
        });
      });
    }
  }

  // delete order in indexedDb ordersOutbox
  public deleteOrderInOutbox(orderId) {
    this.deleteOrderInOrdersOutbox(orderId).then(() => {});
  }

  // delete record in indexedDb recordsOutbox
  public deleteRecordInOutbox(recordId: string) {
    return this.timeRecordsDb.recordsOutbox
      .where('id')
      .equals(recordId)
      .delete()
      .then(function(deleteCount) {
        console.log('Deleted' + deleteCount + 'objects');
      });
  }

  // evtl. noch createdAt mit einbeziehen, damit keine doppelten eintraege vorhanden sind

  // adds record to orders table
  public addRecordToOrdersTable(record, orderId) {
    return this.timeRecordsDb.orders
      .where('id')
      .equals(orderId)
      .toArray(orders => {
        if (orders !== undefined) {
          if (orders.length > 0) {
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
        }
      });
  }

  // adds record to ordersOutbox table
  public addRecordToOrdersOutboxTable(record, orderId) {
    return this.timeRecordsDb.ordersOutbox
      .where('id')
      .equals(+orderId)
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

  public addRecordToRecordsOutboxTable(record) {
    return this.timeRecordsDb.recordsOutbox.add(record).then(data => {
      console.log('Data', data);
      return data;
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

  public getRecordsFromRecordsOutboxTable(): Promise<any> {
    return this.timeRecordsDb.recordsOutbox
      .toArray()
      .then(records => {
        return records;
      })
      .catch(e => {
        console.error('IndexDB getRecordsFromRecordsOutboxTable: ', e);
      });
  }

  public getRecordByIdFromRecordsOutbox(recordId: number) {
    return this.timeRecordsDb.recordsOutbox
      .where('id')
      .equals(recordId)
      .toArray(record => {
        return record[0];
      });
  }

  public getOrderByIdFromOrdersOutbox(orderId: number) {
    return this.timeRecordsDb.ordersOutbox
      .where('id')
      .equals(orderId)
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

  // get orders from orders table
  public getOrdersFromOrdersTable(): Promise<IOrder[]> {
    return this.timeRecordsDb.orders
      .toArray()
      .then((result: any) => {
        return result;
      })
      .catch(e => {
        console.error('Error: indexedDB can not get orders from orders table: Message: ', e);
      });
  }

  public getOrdersFromOrdersOutbox(): Promise<any> {
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

  public deleteRecordInOrdersTable(orderId, recordId) {
    return this.timeRecordsDb.orders
      .where('id')
      .equals(orderId)
      .toArray(order => {
        const records: ITimeRecord[] = order[0].records;
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

  public getAllRecords(orderId): Promise<ITimeRecord[]> {
    return this.timeRecordsDb.orders
      .where('id')
      .equals(orderId)
      .toArray(order => {
        if (order.length !== 0) {
          const records: ITimeRecord[] = order[0].records;
          return records;
        }
      });
  }

  public updateRecordInOrdersTable(orderId: number, record: any) {
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

  public updateRecordInRecordsOutboxTable(record: any): Promise<boolean> {
    // record id in indexedDb recordsOutbox is a number
    // record id in firebase is a string
    const id: number = +record.id;
    record.id = id;
    return new Promise((resolve, reject) => {
      return this.timeRecordsDb.recordsOutbox
        .where('id')
        .equals(record.id)
        .modify(record)
        .then(updated => {
          if (updated) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(error => {
          console.error('Error: indexedDB recordsOutbox: can not update record: ', error);
        });
    });
  }
}
