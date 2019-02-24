import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexedDBService } from '../service/indexedDb.service';
import { Order, IOrder } from '../data-classes/Order';
import { ToastrService } from 'ngx-toastr';
import { CloudFirestoreService } from '../service/cloudFirestore.service';
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
    private indexDbService: IndexedDBService,
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
      if (ordersInOutbox.length > 0) {
        this.getOrdersOnline().then(ordersOnline => {
          ordersInOutbox.forEach(orderInOutbox => {
            if (ordersOnline.length > 0) {
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

  // add order from indexedDB ordersOutbox table to firestore
  // after receiving the firestore id, add order to indexedDB orders table
  // delete order form indexedDB ordersOutbox
  public sychronizeOutboxWithDatabase(ordersToPushToFirebase) {
    ordersToPushToFirebase.forEach(order => {
      this.cloudFirestoreService.addOrder(order).then(id => {
        if (!this.isAlreadyInIndexedDBOrders(order, ordersToPushToFirebase)) {
          const localId = order.id;
          order.id = id;
          this.indexDbService.addToOrdersTable(order).then(() => {
            this.deleteOrderInIndexedDbOrdersOutbox(localId);
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

  // check if new order is already in indexedDB orders or ordersOutbox table
  // if not, add to ordersOutbox otherwise send toast message
  public createOrderIfOffline(newOrder) {
    this.indexDbService.checkIfOrderIsIndexedDBOrdersTable(newOrder).then(isInOrdersTable => {
      if (!isInOrdersTable) {
        return this.indexDbService
          .checkIfOrderIsInIndexedDBOrdersOutboxTable(newOrder)
          .then(isInOrdersOutbox => {
            if (!isInOrdersOutbox) {
              this.indexDbService.addOrderToOutbox(newOrder).then(data => {
                console.log('Added order to outbox', newOrder);
                this.toastMessageOrderSuccessfulCreated();
                this.router.navigate(['/order-details/' + newOrder.id]);
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

  public createOrderIfOnline(order: IOrder): void {
    if (this.isConnected()) {
      // check if order is already in firestore
      this.cloudFirestoreService.checkIfOrderIsInFirestore(order).then(isAlreadyInFirestore => {
        // if order is not in firestore add it
        if (!isAlreadyInFirestore) {
          this.cloudFirestoreService
            .addOrder(order)
            .then(id => {
              this.toastMessageOrderSuccessfulCreated();
              this.router.navigate(['/order-details/' + id]);
            })
            .catch(e => {
              console.error('can´t create order to firebase', e);
            });
        } else {
          this.toastMessageOrderAlreadyExists();
          return;
        }
      });
    }
  }

  public onSubmit() {
    this.createOrder(this.createOrderForm.value);
  }
}
