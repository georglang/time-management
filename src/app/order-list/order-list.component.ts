import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';

import { IndexedDBService } from '../service/indexedDb.service';
import { CloudFirestoreService } from '../service/cloudFirestore.service';
import { ConnectionService } from 'ng-connection-service';
import { SynchronizationService } from './../service/synchronization.service';
import { IOrder } from '../data-classes/Order';
import { ITimeRecord } from '../data-classes/ITimeRecords';

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
    private cloudFirestoreService: CloudFirestoreService,
    private connectionService: ConnectionService,
    private synchronizationService: SynchronizationService
  ) {}

  ngOnInit() {
    // this.getOrdersWithRecordsFromFirebase();

    // this.connectionService.monitor().subscribe(isConnected => {});
    // this.synchronizationService.synchronizeIndexedDbOrdersOutboxTableWithFirebase();

    this.getOrdersIfOnline();
    // this.getOrdersFromIndexedDB();

    // if (this.isOnline()) {
    //   this.getOrdersOnline();
    // } else {
    //   console.warn('No internet connection');
    //   this.getOrdersFromIndexedDB();
    // }
  }

  private getOrdersWithRecordsFromFirebase() {
    this.cloudFirestoreService.getOrdersWithRecords().then(orders => {
      if (orders.length > 0) {
        this.dataSource = new MatTableDataSource(orders);
      }
    });
  }

  public isOnline() {
    return navigator.onLine;
  }

  // if internet connection persists, get data from firebase and save it to indexedDB
  // the firebase unique id will be used as indexedDB key
  public getOrdersIfOnline() {
    if (this.isOnline) {
      this.cloudFirestoreService.getOrdersWithRecords()
        .then(orders => {
          this.orders = orders;
          this.dataSource = new MatTableDataSource(this.orders);
          this.indexDbService.addOrderToOrdersTable(orders);
      });
    }
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
