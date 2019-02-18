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
  public displayedColumns = ['customer', 'contactPerson', 'location', 'detail'];
  public isOnlineService: boolean;
  private ordersFromIndexedDB: any = [];
  private ordersObs: Observable<IOrder[]>;
  private orderIds: number[] = [];

  @ViewChild(MatSort)
  sort: MatSort;

  constructor(
    private indexDbService: IndexDBService,
    private router: Router,
    private cloudFirestoreService: CloudFirestoreService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit() {
    // --> als naechstes machen

    // ToDo
    // Testen
    // Online -> speichern in firebase
    // Offline -> speichern in outbox
    // Offline - Online -> von outbox nach firebase und indexedDB orders speichern schauen ob bereits in indexedDB orders und firbase

    // if state changes from offline to online synchronize ordersOutbox with server
    // and delete orders in outbox

    this.connectionService.monitor().subscribe(isConnected => {
      this.isOnlineService = isConnected;
      if (this.isOnlineService) {
        this.indexDbService.getOrdersFromOutbox().then(orders => {
          if (orders.length !== 0) {
            orders.forEach(order => {
              const id = order.id;
              delete order.id;
              this.cloudFirestoreService.addOrder(order).then(() => {
                this.indexDbService.ordersInOrdersTable().then(ordersInIndexedDB => {
                  if (ordersInIndexedDB.length > 0) {
                    ordersInIndexedDB.forEach(cachedOrder => {
                      this.orderIds.push(cachedOrder.id);
                    });
                    orders.forEach(_order => {
                      if (!this.orderIds.includes(_order.id)) {
                        this.indexDbService.addToOrdersTable(order).then(() => {
                          this.indexDbService.deleteOrderFromOutbox(id)
                            .then(() => {
                              this.orderIds = [];
                            });
                        });
                      }
                    });
                  } else {
                    this.indexDbService.addToOrdersTable(order).then(() => {
                      this.indexDbService.deleteOrderFromOutbox(id);
                    });
                  }
                });
              });
            });
          }
        });
      }
    });

    this.getOrdersFromIndexedDB();

    // if (this.isOnline()) {
    //   this.getOrdersOnline();
    // } else {
    //   console.warn('No internet connection');
    //   this.getOrdersFromIndexedDB();
    // }
  }

  public isOnline() {
    return navigator.onLine;
  }

  // if internet connection persists, get data from firebase and save it to indexedDB
  // the firebase unique id will be used as indexedDB key
  public getOrdersOnline() {
    if (this.isOnline) {
      this.ordersObs = this.cloudFirestoreService.getOrders();
      this.ordersObs.subscribe(orders => {
        this.orders = orders;
        if (this.orders.length !== 0) {
          this.orders.forEach(order => {
            this.indexDbService.ordersInOrdersTable().then(ordersInIndexedDB => {
              ordersInIndexedDB.forEach(cachedOrder => {
                this.orderIds.push(cachedOrder.id);
              });
              this.orders.forEach(_order => {
                if (!this.orderIds.includes(_order.id)) {
                  this.indexDbService.addToOrdersTable(order);
                }
              });
            });
            this.dataSource = new MatTableDataSource(this.orders);
          });
        }
      });
    }
  }

  // if no internet connection persists, data from indexedDB orders and outboxForOrders tables will be fetched
  public getOrdersFromIndexedDB() {
    // if (!this.isOnline()) {
    this.indexDbService
      .ordersInOrdersTable()
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
