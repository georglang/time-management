import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { IndexedDBService } from '../service/indexedDb-service/indexedDb.service';
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
  public isOnline: boolean;
  public orders: any[]; // IOrder coudn´t be used because of firebase auto generated id,

  constructor(
    private formBuilder: FormBuilder,
    private indexDbService: IndexedDBService,
    private router: Router,
    private toastr: ToastrService,
    private firestoreOrderService: FirestoreOrderService,
    private synchronizeIdxDBWithFirebase: SynchronizeIdxDBWithFirebaseService,
    private connectionService: ConnectionService,
    private messageService: MessageService
  ) {
    this.columns = ['Firma', 'Ansprechpartner', 'Ort'];

    this.createOrderForm = this.formBuilder.group({
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
    //     this.checkIfOrdersAreInOrdersTable();
    //   }
    // });
    this.synchronizeIdxDBWithFirebase.synchronizeIndexedDbOrdersOutboxTableWithFirebase();
  }

  public isConnected() {
    return navigator.onLine;
  }

  public navigateToOrderList() {
    this.router.navigate(['/']);
  }



  public createOrder(formInput: any) {
    const newOrder = new Order(
      formInput.companyName,
      formInput.location,
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

  // check if new order is already in indexedDB orders table (same orders than online)
  // if already in orders table, send message "order already exists"
  // if not in orders table, check if order is in indexedDB ordersOutbox
  // if not in ordersOutbox add to ordersOutbox
  // if in ordersOutbox, send message "order already exists"
  public createOrderIfOffline(newOrder) {
    this.indexDbService.checkIfOrderIsInIndexedDBOrdersTable(newOrder).then(isInOrdersTable => {
      if (!isInOrdersTable) {
        return this.indexDbService
          .checkIfOrderIsInIndexedDBOrdersOutboxTable(newOrder)
          .then(isInOrdersOutbox => {
            if (!isInOrdersOutbox) {
              this.indexDbService.addOrderToOutbox(newOrder).then(data => {
                this.messageService.orderCreatedSuccessful();
                this.router.navigate(['/order-details/' + newOrder.id]);
              });
            } else {
              this.messageService.orderAlreadyExists();
            }
          });
      } else {
        this.messageService.orderAlreadyExists();
      }
    });
  }

  public createOrderIfOnline(order: IOrder): void {
    if (this.isConnected()) {
      // check if order is already in firestore
      this.firestoreOrderService.checkIfOrderExists(order).then(isAlreadyInFirestore => {
        // if order is not in firestore add it
        if (!isAlreadyInFirestore) {
          this.firestoreOrderService
            .addOrder(order)
            .then(id => {
              this.messageService.orderCreatedSuccessful();
              this.router.navigate(['/order-details/' + id]);
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

  public onSubmit() {
    this.createOrder(this.createOrderForm.value);
  }
}
