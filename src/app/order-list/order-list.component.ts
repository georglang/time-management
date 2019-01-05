import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSort, MatTableDataSource } from '@angular/material';
import { IndexDBService } from '../service/index-db.service';
import { IOrder } from './../data-classes/order';
import { CloudFirestoreService } from '../service/cloud-firestore.service';
import { ConnectionService } from 'ng-connection-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.sass']
})
export class OrderListComponent implements OnInit {
  public orders: any[]; // IOrder coudn´t be used because of firebase auto generated id,
  public dataSource = new MatTableDataSource();
  public displayedColumns = ['customer', 'contactPerson', 'location', 'icon'];
  public isOnline: boolean;
  private ordersFromIndexedDB: any = [];
  private ordersObs: Observable<IOrder[]>;

  @ViewChild(MatSort)
  sort: MatSort;

  constructor(
    private indexDbService: IndexDBService,
    private router: Router,
    private cloudFirestoreService: CloudFirestoreService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit() {
    // if state changes from offline to online synchronize ordersOutbox with server
    // and delete orders in outbox
    this.connectionService.monitor().subscribe(isConnected => {
      this.isOnline = isConnected;
      if (this.isOnline) {
        this.indexDbService.getOrdersFromOutbox().then(orders => {
          if (orders.length !== 0) {
            orders.forEach(order => {
              const id = order.id;
              delete order.id;
              this.cloudFirestoreService.addOrder(order).then(() => {
                this.indexDbService.deleteOrderFromOutbox(id);
              });
            });
          }
        });
      }
    });
    this.getOrders();
  }

  // if internet connection persists, get data from firebase and save it to indexedDB
  // the firebase unique id will be used as indexedDB key
  public getOrders() {
    const orderIds: string[] = [];
    if (this.isOnline) {
      this.ordersObs = this.cloudFirestoreService.getOrders();
      this.ordersObs.subscribe(orders => {
        this.orders = orders;
        this.orders.forEach(order => {
          if (this.orders.length !== 0) {
            this.indexDbService.getAllOrders().then(ordersInIndexedDB => {
              ordersInIndexedDB.forEach(cachedOrder => {
                orderIds.push(cachedOrder.id);
              });
              this.orders.forEach(_order => {
                if (!orderIds.includes(_order.id)) {
                  this.indexDbService.addOrder(order);
                }
              });
            });
          }
          this.dataSource = new MatTableDataSource(this.orders);
        });
      });
    } else {
      console.warn('No internet connection');
      // data from indexedDB orders and outboxForOrders tables will be fetched
      this.indexDbService
        .getAllOrders()
        .then(ordersTable => {
          ordersTable.forEach(order => {
            this.ordersFromIndexedDB.push(order);
          });
        })
        .then(() => {
          this.indexDbService.getOrdersFromOutbox().then(ordersOutboxTable => {
            ordersOutboxTable.forEach(order => {
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

  navigateToCreateOrder() {
    this.router.navigate(['/create-order']);
  }
}
