import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';

import { IndexedDBService } from '../service/indexedDb-service/indexedDb.service';
import { FirestoreOrderService } from '../service/firestore-order-service/firestore-order.service';
import { FirestoreRecordService } from '../service/firestore-record-service/firestore-record.service';
import { ConnectionService } from 'ng-connection-service';
import { SynchronizeIdxDBWithFirebaseService } from './../service/synchronize-idxDb-with-firebase-service/synchronize-idxDb-with-firebase.service';
import { SynchronizeFirebaseWithIdxDbService } from './../service/synchronize-firebase-with-idxDb.service/synchronize-firebase-with-idxDb.service';
import { IOrder } from '../data-classes/Order';
import { ITimeRecord } from '../data-classes/TimeRecords';

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

  @ViewChild(MatSort)
  sort: MatSort;

  constructor(
    private indexDbService: IndexedDBService,
    private router: Router,
    private firestoreOrderService: FirestoreOrderService,
    private firestoreRecordService: FirestoreRecordService,
    private connectionService: ConnectionService,
    private synchronizeIdxDbWithFirebase: SynchronizeIdxDBWithFirebaseService,
    private synchronizeFirebaseWithIdxDb: SynchronizeFirebaseWithIdxDbService
  ) {}

  ngOnInit() {
    // wenn online vorher synchronisieren, wenn offline direkt aus orders table
    // und in oders outbox, records outbox nachschauen
    // orders immer aus indexedDB orders table laden
    // synch with firebase
    // offline
    // else {
    // this.indexDbService.getOrdersFromOrdersTable().then((orders: IOrder[]) => {
    //   this.dataSource = new MatTableDataSource(orders);
    // });
    // }
    // this.getOrdersWithRecordsFromFirebase();
    // this.connectionService.monitor().subscribe(isConnected => {});
    // this.synchronizationService.synchronizeIndexedDbOrdersOutboxTableWithFirebase();
    // this.getOrdersFromIndexedDB();
    // if (this.isOnline()) {
    //   this.getOrdersOnline();
    // } else {
    //   console.warn('No internet connection');
    //   this.getOrdersFromIndexedDB();
    // }
    // offline ordersOutox durchsuchen, wenn ordersoutbox vorhanden, dann kann es auch records dazu geben,
    // oder anhand von orders id in orders table kann es records in records outbox geben
  }

  public sync() {
    this.synchronizeFirebaseWithIdxDb.synchronize().then(synchCompleted => {
      if (synchCompleted) {
      }
    });
  }

  public getOrdersFromIndexedDb() {
    this.indexDbService.getOrdersFromOrdersTable().then((orders: IOrder[]) => {
      debugger;
      this.dataSource = new MatTableDataSource(orders);
    });
  }

  public isOnline() {
    return navigator.onLine;
  }

  // if no internet connection persists
  // orders from indexedDB orders and ordersOutbox tables will be fetched
  public getOrdersIfOffline() {
    // if (!this.isOnline()) {
    this.indexDbService.getOrdersFromOrdersTable().then(ordersInOrdersTabel => {
      if (ordersInOrdersTabel.length > 0) {
        ordersInOrdersTabel.forEach(order => {
          this.ordersFromIndexedDB.push(order);
        });
      }
      this.indexDbService.getOrdersFromOrdersOutbox().then(ordersInOutboxTable => {
        ordersInOutboxTable.forEach(order => {
          this.ordersFromIndexedDB.push(order);
        });
        this.dataSource = new MatTableDataSource(this.ordersFromIndexedDB);
      });
    });
    // }
  }

  public applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLocaleLowerCase();
    this.dataSource.filter = filterValue;
  }

  getRecord(row: any) {
    this.router.navigate(['/order-details/' + row.id]);
  }

  navigateToCreateOrder() {
    this.router.navigate(['/create-order']);
  }
}
