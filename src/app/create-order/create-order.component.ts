import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

// import { IndexedDBService } from '../service/indexedDb-service/indexedDb.service';
import { SynchronizeIdxDBWithFirebaseService } from './../service/synchronize-idxDb-with-firebase-service/synchronize-idxDb-with-firebase.service';
import { Order, IOrder } from '../data-classes/Order';

import { ToastrService } from 'ngx-toastr';
import { FirestoreOrderService } from '../service/firestore-order-service/firestore-order.service';
import { ConnectionService } from 'ng-connection-service';
import { MessageService } from '../service/message-service/message.service';
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
  private ordersOnline: IOrder[] = [];
  private tempOrders: any[] = [];
  public _isOnline: boolean;
  public orders: any[]; // IOrder coudn´t be used because of firebase auto generated id,

  constructor(
    private formBuilder: FormBuilder,
    // private indexedDbService: IndexedDBService,
    private router: Router,
    private toastr: ToastrService,
    private firestoreOrderService: FirestoreOrderService,
    private synchronizeIdxDBWithFirebase: SynchronizeIdxDBWithFirebaseService,
    private connectionService: ConnectionService,
    private messageService: MessageService
  ) {
    this.columns = ['Datum', 'Firma', 'Einsatzleiter', 'Ort'];

    this.createOrderForm = this.formBuilder.group({
      date: ['', Validators.required],
      companyName: ['', Validators.required],
      location: ['', Validators.required],
      contactPerson: ['']
    });
  }

  ngOnInit() {
    // detects transition from offline to online and from online to offline
    // this.connectionService.monitor().subscribe(isConnected => {
    //   this.isOnline = isConnected;
    //   if (this.isOnline) {
    //     // this.checkIfOrdersAreInOrdersTable();
    //   }
    // });
    // this.synchronizeIdxDBWithFirebase.synchronizeIndexedDbOrdersOutboxTableWithFirebase();
    // if (this.isOnline()) {
    // }
  }

  public isOnline() {
    return navigator.onLine;
  }

  public navigateToOrderList() {
    this.router.navigate(['/']);
  }

  // check if new order is already in indexedDB orders table (same orders than online)
  // if already in orders table, send message "order already exists"
  // if not in orders table, check if order is in indexedDB ordersOutbox
  // if not in ordersOutbox add to ordersOutbox
  // if in ordersOutbox, send message "order already exists"
  // public createOrderIfOffline(order) {
  //   this.indexedDbService.checkIfOrderIsInIndexedDBOrdersTable(order).then(isInOrdersTable => {
  //     if (!isInOrdersTable) {
  //       this.indexedDbService.addOrderToOrdersTable(order).then(data => {
  //         this.messageService.orderCreatedSuccessful();
  //         this.router.navigate(['/order-details/' + order.id]);
  //       });
  //       return this.indexedDbService
  //         .checkIfOrderIsInIndexedDBOrdersOutboxTable(order)
  //         .then(isInOrdersOutbox => {
  //           if (!isInOrdersOutbox) {
  //             this.indexedDbService.addOrderToOutbox(order);
  //           } else {
  //             this.messageService.orderAlreadyExists();
  //           }
  //         });
  //     } else {
  //       this.messageService.orderAlreadyExists();
  //     }
  //   });
  // }

  public createOrder(formInput: any): void {
    const order = new Order(
      formInput.date,
      formInput.companyName,
      formInput.location,
      formInput.contactPerson,
    );
    order.records = [];
    if (this.isOnline()) {
      this.addOrderToFirebaseOrdersTable(order);
    } else {
      // this.createOrderIfOffline(order);
    }
  }

  public addOrderToFirebaseOrdersTable(order: IOrder): void {
    if (this.firestoreOrderService !== undefined) {
      // check if order is already in firestore
      this.firestoreOrderService.checkIfOrderExists(order).then((isAlreadyInFirestore: boolean) => {
        if (!isAlreadyInFirestore) {
          this.firestoreOrderService
            .addOrder(order)
            .then((id: string) => {



              this.messageService.orderCreatedSuccessful();
              this.router.navigate(['/order-details/' + id]);
              order.id = id;
              // this.addOrdersToIndexedDbOrdersTable(order);
            })
            .catch(e => {
              console.error('can´t create order to firebase', e);
            });
        } else {
          this.messageService.orderAlreadyExists();
          return;
        }
      });
    }
  }

  // public addOrdersToIndexedDbOrdersTable(order: IOrder): void {
  //   const _orders: IOrder[] = [];
  //   _orders.push(order);
  //   this.indexedDbService.addOrdersWithRecordsToOrdersTable(_orders);
  // }

  public onSubmit() {
    this.createOrder(this.createOrderForm.value);
  }
}
