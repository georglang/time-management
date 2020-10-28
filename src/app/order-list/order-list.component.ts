import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ConnectionService } from 'ng-connection-service';

import { FirestoreOrderService } from '../service/firestore-order-service/firestore-order.service';
import { IndexedDBService } from '../service/indexedDb-service/indexedDb.service';
import { IOrder } from '../data-classes/Order';

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

  @ViewChild(MatSort, { static: false })
  sort: MatSort;

  constructor(
    private indexedDbService: IndexedDBService,
    private router: Router,
    private firestoreOrderService: FirestoreOrderService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit() {
    // if (this.isOnline()) {
    //   this.getOrdersFromCloudDatabase();
    // } else {
    //   console.warn('No internet connection');
    //   this.getOrdersFromIndexedDb();
    // }

    this.getOrdersFromCloudDatabase();

    // ToDo: Connection turns from Offline to online
    if (this.connectionService !== undefined) {
      this.connectionService.monitor().subscribe(isOnline => {});
    }
  }

  public isOnline(): boolean {
    return navigator.onLine;
  }

  //
  // Online Handling
  //

  public getOrdersFromCloudDatabase(): void {
    // if (this.firestoreOrderService !== undefined) {
    //   this.firestoreOrderService.getOrdersFromOrdersCollection()
    //     .then((orders: IOrder[]) => {
    //     if (orders !== undefined) {
    //       this.dataSource = new MatTableDataSource<IOrder>(orders);
    //       // this.saveOrdersInIndexedDBOrdersTable(orders);
    //     } else {
    //       this.dataSource = new MatTableDataSource<IOrder>();
    //     }
    //   });
    // }

    if (this.firestoreOrderService !== undefined) {
      this.firestoreOrderService.getOrdersFromOrdersCollection2().subscribe((orders: IOrder[]) => {
        if (orders !== undefined) {
          this.dataSource.data = orders;
        } else {
          this.dataSource = new MatTableDataSource();
          //       // ToDo: Meldung in HTML kein Aufträge vorhanden
        }
      });
    }
  }

  //
  // Offline Handling
  //

  // public saveOrdersInIndexedDBOrdersTable(orders: IOrder[]): void {
  //   if (this.indexedDbService !== undefined) {
  //     this.indexedDbService.addOrdersWithRecordsToOrdersTable(orders);
  //   }
  // }

  public getOrdersFromIndexedDb(): void {
    if (this.indexedDbService !== undefined) {
      this.indexedDbService.getOrdersFromOrdersTable().then((orders: IOrder[]) => {
        if (orders.length > 0) {
          this.dataSource = new MatTableDataSource<IOrder>(orders);
        } else {
          // ToDo: Meldung in HTML kein Aufträge vorhanden
          this.dataSource = new MatTableDataSource<IOrder>();
        }
      });
    }
  }

  public applyFilter(filterValue: string): void {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLocaleLowerCase();
    this.dataSource.filter = filterValue;
  }

  public navigateToOrder(orderId: string): void {
    this.router.navigate(['/order-details/' + orderId]);
  }

  public navigateToCreateOrder(): void {
    this.router.navigate(['/create-order']);
  }
}
