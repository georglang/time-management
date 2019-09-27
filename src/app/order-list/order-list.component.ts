import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

import { IndexedDBService } from '../service/indexedDb-service/indexedDb.service';
import { FirestoreOrderService } from '../service/firestore-order-service/firestore-order.service';
import { FirestoreRecordService } from '../service/firestore-record-service/firestore-record.service';
import { ConnectionService } from 'ng-connection-service';
import { SynchronizeIdxDBWithFirebaseService } from './../service/synchronize-idxDb-with-firebase-service/synchronize-idxDb-with-firebase.service';
import { SynchronizeFirebaseWithIdxDbService } from './../service/synchronize-firebase-with-idxDb.service/synchronize-firebase-with-idxDb.service';
import { IOrder } from '../data-classes/Order';
import { ITimeRecord } from '../data-classes/TimeRecords';

// ToDo
// Initially fetch the existing orders

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.sass']
})
export class OrderListComponent implements OnInit {
  public orders: any[] = []; // IOrder coudn´t be used because of firebase auto generated id,
  public dataSource = new MatTableDataSource();
  public displayedColumns = ['customer', 'contactPerson', 'location', 'detail'];
  public isOnlineService: boolean;
  private ordersFromIndexedDB: any = [];
  private ordersObs: Observable<IOrder[]>;
  private orderIds: number[] = [];

  @ViewChild(MatSort, { static: false })
  sort: MatSort;
  x;
  constructor(
    private indexedDbService: IndexedDBService,
    private router: Router,
    private firestoreOrderService: FirestoreOrderService,
    private firestoreRecordService: FirestoreRecordService,
    private connectionService: ConnectionService,
    private synchronizeIdxDbWithFirebase: SynchronizeIdxDBWithFirebaseService,
    private synchronizeFirebaseWithIdxDb: SynchronizeFirebaseWithIdxDbService
  ) {}

  ngOnInit() {
    if (this.isOnline()) {
      this.getOrdersFromCloudDatabase();
    } else {
      console.warn('No internet connection');
      this.getOrdersFromIndexedDb();
    }

    // ToDo: Connection turns from Offline to online
    if (this.connectionService !== undefined) {
      this.connectionService.monitor().subscribe(isOnline => {});
    }

    // offline ordersOutox durchsuchen, wenn ordersoutbox vorhanden, dann kann es auch records dazu geben,
    // oder anhand von orders id in orders table kann es records in records outbox geben
  }

  public isOnline(): boolean {
    return navigator.onLine;
  }

  public navigateToCreateOrder(): void {
    this.router.navigate(['/create-order']);
  }

  //
  // Online Handling
  //

  // ToDo: Promise --> Observable
  // public getOrdersFromCloudDatabase(): void {
  //   if (this.firestoreOrderService !== undefined) {
  //     this.firestoreOrderService.getOrders().then((orders: IOrder[]) => {
  //       if (orders !== undefined) {
  //         this.dataSource = new MatTableDataSource(orders);
  //         this.saveOrdersInIndexedDBOrdersTable(orders);
  //       }
  //     });
  //   }
  // }

  public getOrdersFromCloudDatabase(): void {
    if (this.firestoreOrderService !== undefined) {
      this.firestoreOrderService.getOrders().subscribe((orders: IOrder[]) => {
        if (orders !== undefined) {
          this.dataSource = new MatTableDataSource(orders);
          this.saveOrdersInIndexedDBOrdersTable(orders);
        }
      });
    }
  }

  public saveOrdersInIndexedDBOrdersTable(orders: IOrder[]): void {
    this.indexedDbService.addOrdersWithRecordsToOrdersTable(orders);
  }

  //
  // Offline Handling
  //

  // if offline get orders from indexedDB orders table
  public getOrdersFromIndexedDb() {
    if (this.indexedDbService !== undefined) {
      this.indexedDbService.getOrdersFromOrdersTable().then((orders: IOrder[]) => {
        this.dataSource = new MatTableDataSource(orders);
      });
    }
  }

  public sync() {
    this.synchronizeFirebaseWithIdxDb.synchronize().subscribe(synchCompleted => {
      if (synchCompleted) {
      }
    });
  }

  // if no internet connection persists
  // orders from indexedDB orders and ordersOutbox tables will be fetched
  public getOrdersIfOffline() {
    if (!this.isOnline()) {
      this.indexedDbService.getOrdersFromOrdersTable().then(ordersInOrdersTabel => {
        if (ordersInOrdersTabel.length > 0) {
          ordersInOrdersTabel.forEach(order => {
            this.ordersFromIndexedDB.push(order);
          });
        }
        this.indexedDbService.getOrdersFromOrdersOutbox().then(ordersInOutboxTable => {
          ordersInOutboxTable.forEach(order => {
            this.ordersFromIndexedDB.push(order);
          });
          this.dataSource = new MatTableDataSource(this.ordersFromIndexedDB);
        });
      });
    }
  }

  public applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLocaleLowerCase();
    this.dataSource.filter = filterValue;
  }

  getRecord(row: any) {
    this.router.navigate(['/order-details/' + row.id]);
  }
}
