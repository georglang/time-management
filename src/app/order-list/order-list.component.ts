import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSort, MatTableDataSource } from '@angular/material';
import { IndexDBService } from '../service/index-db.service';
import { Order } from './../data-classes/order';
import { CloudFirestoreService } from '../service/cloud-firestore.service';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.sass']
})
export class OrderListComponent implements OnInit {
  public orders: Order[] = [];
  public dataSource = new MatTableDataSource();
  public displayedColumns = ['customer', 'contactPerson', 'location', 'icon'];
  private isOnline: boolean;

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
    this.connectionService.monitor().subscribe(isConnected => {
      this.isOnline = isConnected;
      console.log('Is Connected', this.isOnline);
    });

    if (this.isConnected) {
      this.cloudFirestoreService
        .getOrders()
        .then(ordersOnline => {
          this.indexDbService.getAllOrders().then(cachedOrders => {
            cachedOrders.forEach(cachedOrder => {
              orderIds.push(cachedOrder.dbId);
            });
            ordersOnline.forEach(order => {
              this.orders.push(
                new Order(
                  order.data().companyName,
                  order.data().location,
                  order.data().id,
                  order.data().contactPerson
                )
              );
              this.dataSource = new MatTableDataSource(this.orders);
              if (!orderIds.includes(order.dbId)) {
                this.indexDbService.addOrder(order.data()).then(data => {});
              }
            });
          });
        })
        .catch(error => {
          console.log('No orders found');
        });
    } else {
      this.getOrdersFromIndexedDB();
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

  createOrder() {
    this.router.navigate(['/create-order']);
  }

  getOrdersFromIndexedDB() {
    this.indexDbService.getAllOrders().then(allOrders => {
      allOrders.forEach(order => {
        this.orders.push(
          new Order(order.companyName, order.location, order.id, order.contactPerson)
        );
      });
      this.dataSource = new MatTableDataSource(this.orders);
    });
  }

  public insertToCloudDB() {
    this.indexDbService.getAllOrders().then(orders => {
      console.log('Orders', orders);
      orders.forEach(order => {
        this.cloudFirestoreService.addOrder(order);
      });
    });
  }

  public getFromCloudDB() {
    this.cloudFirestoreService.getOrders().then(orders => {
      console.log('Orders', orders);
    });
  }
}
