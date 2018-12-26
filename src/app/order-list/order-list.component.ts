import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSort, MatTableDataSource } from '@angular/material';
import { IndexDBService } from '../service/index-db.service';
import { IOrder, Order } from './../data-classes/order';
import { CloudFirestoreService } from '../service/cloud-firestore.service';
import { ConnectionService } from 'ng-connection-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators/';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.sass']
})
export class OrderListComponent implements OnInit {
  public orders: IOrder[];
  public dataSource = new MatTableDataSource();
  public displayedColumns = ['customer', 'contactPerson', 'location', 'icon'];
  public isOnline: boolean;

  private ordersObs: Observable<IOrder[]>;

  @ViewChild(MatSort)
  sort: MatSort;

  constructor(
    private indexDbService: IndexDBService,
    private router: Router,
    private route: ActivatedRoute,
    private cloudFirestoreService: CloudFirestoreService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit() {
    const orderIds = [];

    this.cloudFirestoreService.getCompleteData();

    // if state changes from offline to online synchronize ordersOutbox with server
    this.connectionService.monitor().subscribe(isConnected => {
      this.indexDbService.getOrdersFromOutbox().then(orders => {
        if (orders.length !== 0) {
          orders.forEach(order => {
            this.cloudFirestoreService.addOrder(order).then(id => {
              this.indexDbService.deleteOrderFromOutbox(id + '').then(data => {
                console.log('deleted form outbox', data);
              });
            });
          });
        }
      });
    });

    // If internet connection persists, get data from firebase instead from indexedDB
    if (this.isConnected()) {
      this.ordersObs = this.cloudFirestoreService.getOrders();
      this.ordersObs.subscribe(orders => {
        this.orders = orders;
        this.orders.forEach(order => {
          this.cloudFirestoreService.getRecords(order.id).subscribe(records => {
            order.records = records;
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
      });
    } else {
      console.log('No internet connection');
      this.indexDbService.getAllOrders().then(data => {
        this.dataSource = new MatTableDataSource(data);
      });
    }
  }

  public isConnected() {
    return navigator.onLine;
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
