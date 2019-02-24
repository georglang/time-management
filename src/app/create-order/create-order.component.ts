import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { Order, IOrder } from '../data-classes/order';
import { ToastrService } from 'ngx-toastr';
import { CloudFirestoreService } from './../service/cloud-firestore.service';
import { ConnectionService } from 'ng-connection-service';
import _ from 'lodash';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.sass']
})
export class CreateOrderComponent implements OnInit {
  public createOrderForm: FormGroup;
  public columns: string[];
  private newOrder: IOrder;
  private isAlreadyInFirestore = false;
  private ordersOnline: IOrder[] = [];
  private tempOrders: any[] = [];
  public isOnline: boolean;
  public orders: any[]; // IOrder coudn´t be used because of firebase auto generated id,

  constructor(
    private formBuilder: FormBuilder,
    private indexDbService: IndexDBService,
    private router: Router,
    private toastr: ToastrService,
    private cloudFirestoreService: CloudFirestoreService,
    private connectionService: ConnectionService
  ) {
    this.columns = ['Firma', 'Ansprechpartner', 'Ort'];

    this.createOrderForm = this.formBuilder.group({
      companyName: ['', Validators.required],
      location: ['', Validators.required],
      contactPerson: ['']
    });
  }

  ngOnInit() {
    const ordersToPushToFirebase: string[] = [];
    // detects transition from offline to online and from online to offline
    // this.connectionService.monitor().subscribe(isConnected => {
    //   this.isOnline = isConnected;
    //   if (this.isOnline) {
    //     this.checkIfOrdersAreInOrdersTable();
    //   }
    // });
    this.indexDbService.getOrdersFromOutbox().then(ordersInOutbox => {
      if (ordersInOutbox.length !== 0) {
        this.getOrdersOnline().then(ordersOnline => {
          ordersInOutbox.forEach(orderInOutbox => {
            if (ordersOnline.length !== 0) {
              if (!this.compareIfOrderIsOnline(orderInOutbox, ordersOnline)) {
                ordersToPushToFirebase.push(orderInOutbox);
              }
            } else {
              ordersToPushToFirebase.push(orderInOutbox);
            }
          });
          this.sychronizeOutboxWithDatabase(ordersToPushToFirebase);
        });
      } else {
        // if no orders are in ordersOutbox, synchronization is not necessary
        return;
      }
    });
  }

  public compareIfOrderIsOnline(orderInOutbox, ordersOnline) {
    const orderInOutboxCpy = orderInOutbox;
    delete orderInOutboxCpy.createdAt;
    delete orderInOutboxCpy.id;
    let isOrderAlreadyOnline = false;
    ordersOnline.forEach(orderOnline => {
      delete orderOnline.createdAt;
      delete orderOnline.id;
      if (_.isEqual(orderOnline, orderInOutboxCpy)) {
        return (isOrderAlreadyOnline = true);
      }
    });
    return isOrderAlreadyOnline;
  }

  public isAlreadyInIndexedDBOrders(orderToPush, orders) {
    let isAlreadyInIndexedDB = false;
    orders.forEach(order => {
      if (_.isEqual(orderToPush, orders)) {
        return (isAlreadyInIndexedDB = true);
      }
    });
    return isAlreadyInIndexedDB;
  }

  // get orders from firestore database
  public getOrdersOnline() {
    return this.cloudFirestoreService.getDocumentsInOrdersCollection().then(ordersInFirestore => {
      return ordersInFirestore;
    });
  }

  // push orders from ordersOutbox to Firestore
  // if orders are in Firestore push to indexedDB Orders
  public sychronizeOutboxWithDatabase(ordersToPushToFirebase) {
    ordersToPushToFirebase.forEach(order => {
      this.cloudFirestoreService.addOrder(order).then(() => {
        if (!this.isAlreadyInIndexedDBOrders(order, ordersToPushToFirebase)) {
          this.indexDbService.addToOrdersTable(order).then(() => {
            this.deleteOrderInIndexedDbOrdersOutbox(order.id);
          });
        }
      });
    });
  }

  // delete order in indexedDbOrdersOutbox
  // check if orders are in firebase delete from ordersOutbox
  public deleteOrderInIndexedDbOrdersOutbox(orderId) {
    this.indexDbService.deleteOrderFromOutbox(orderId).then(() => {});
  }

  public isConnected() {
    return navigator.onLine;
  }

  public navigateToOrderList() {
    this.router.navigate(['/']);
  }

  public toastMessageOrderSuccessfulCreated() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.success('Erfolgreich erstellt', 'Auftrag', successConfig);
  }

  public toastMessageOrderAlreadyExists() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.error('Existiert bereits', 'Auftrag', successConfig);
  }

  public createOrder(formInput: any) {
    const newOrder = new Order(
      formInput.companyName,
      formInput.location,
      new Date(),
      formInput.contactPerson
    );
    newOrder.records = [];

    this.createOrderIfOffline(newOrder);

    // if (this.isConnected()) {
    //   this.createOrderIfOnline();
    // } else {
    //   this.createOrderIfOffline();
    // }
  }

  public createOrderIfOnline(): void {
    if (this.isConnected()) {
      // check if order is already in firestore
      this.cloudFirestoreService.getDocumentsInOrdersCollection().then(data => {
        this.ordersOnline = data;

        this.isAlreadyInFirestore = false;
        if (this.ordersOnline.length > 0) {
          this.ordersOnline.forEach(order => {
            this.tempOrders.push({
              companyName: order.companyName,
              location: order.location,
              contactPerson: order.contactPerson
            });
          });

          const newOrderToCompare = {
            companyName: this.newOrder.companyName,
            location: this.newOrder.location,
            contactPerson: this.newOrder.contactPerson
          };

          this.tempOrders.forEach(order => {
            if (_.isEqual(order, newOrderToCompare)) {
              this.isAlreadyInFirestore = true;
              return;
            }
          });
          // if order is not in firestore add it
          if (!this.isAlreadyInFirestore) {
            this.cloudFirestoreService
              .addOrder(this.newOrder)
              .then(id => {
                this.toastMessageOrderSuccessfulCreated();
                this.isAlreadyInFirestore = true;
                this.router.navigate(['/order-details/' + id]);
                return;
              })
              .catch(e => {
                console.error('can´t create order to firebase', e);
              });
          } else {
            this.toastMessageOrderAlreadyExists();
            return;
          }
        } else {
          this.cloudFirestoreService
            .addOrder(this.newOrder)
            .then(id => {
              this.toastMessageOrderSuccessfulCreated();
              this.isAlreadyInFirestore = true;
              this.router.navigate(['/order-details/' + id]);
              return;
            })
            .catch(e => {
              console.error('can´t create order to firebase', e);
            });
        }
      });
    }
  }

  // check if order is in indexedDB ordersOutbox
  public checkIfOrderIsInIndexedDBOrdersOutboxTable(order): Promise<boolean> {
    let isAlreadyInOrdersOutboxTable = true;
    return new Promise((resolve, reject) => {
      this.indexDbService.getOrdersFromOutbox().then(ordersInOutbox => {
        if (ordersInOutbox !== undefined) {
          if (ordersInOutbox.length !== 0) {
            const orders = [];
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
      this.indexDbService.getOrdersFromOrdersTable().then(_orders => {
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

  // check if new order is already in indexedDB orders or ordersOutbox table
  // if not, add to ordersOutbox otherwise send toast message
  public createOrderIfOffline(newOrder) {
    this.checkIfOrderIsIndexedDBOrdersTable(newOrder).then(isInOrdersTable => {
      if (!isInOrdersTable) {
        return this.checkIfOrderIsInIndexedDBOrdersOutboxTable(newOrder).then(isInOrdersOutbox => {
          if (!isInOrdersOutbox) {
            this.indexDbService.addOrderToOutbox(newOrder).then(data => {
              console.log('Added order to outbox', newOrder);
              this.toastMessageOrderSuccessfulCreated();
            });
          } else {
            this.toastMessageOrderAlreadyExists();
          }
        });
      } else {
        this.toastMessageOrderAlreadyExists();
      }
    });
  }

  public onSubmit() {
    this.createOrder(this.createOrderForm.value);
  }
}
