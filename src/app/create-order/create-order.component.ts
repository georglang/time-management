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
  private isAlreadyInOutbox = true;
  private isAlreadyInFirestore = false;
  private ordersOnline: IOrder[] = [];
  private tempOrders: any[] = [];
  private orderIds: number[] = [];
  public isOnline: boolean;
  public orders: any[]; // IOrder coudn´t be used because of firebase auto generated id,
  // private ordersToPushToFirebase: IOrder[] = [];

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

    // if no orders in firestore push it

    // Wenn Orders in der Datenbank sind, überprüfen, ob orders aus outbox schon online vorhande
    // Wenn keine Orders in Datenbank, kann Outbox direkt gepushed werden

    // Wechsel von Offline nach Online, schauen ob orders in ordersOutbox

    this.indexDbService.getOrdersFromOutbox().then(ordersInOutbox => {
      if (ordersInOutbox.length !== 0) {
        this.getOrdersOnline().then(ordersOnline => {
          ordersInOutbox.forEach(orderInOutbox => {
            if (ordersOnline.length !== 0) {
              if (!this.checkIfOrderIsAlreadyOnline(orderInOutbox, ordersOnline)) {
                ordersToPushToFirebase.push(orderInOutbox);
              }
            } else {
              ordersToPushToFirebase.push(orderInOutbox);
            }
          });
          this.sychronizeOutboxWithDatabase(ordersToPushToFirebase);
        });
      } else {
        // if no orders are in ordersOubox, synchronization is not necessary
        return;
      }
    });
  }

  public checkIfOrderIsAlreadyOnline(orderInOutbox, ordersOnline) {
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
        debugger;
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

  //         this.indexDbService.ordersInOrdersTable().then(ordersInIndexedDB => {
  //           ordersInIndexedDB.forEach(cachedOrder => {
  //             this.orderIds.push(cachedOrder.id);
  //           });
  //           this.orders.forEach(_order => {
  //             if (!this.orderIds.includes(_order.id)) {
  //               this.indexDbService.addToOrdersTable(order).then(() => {
  //                 //this.indexDbService.deleteOrderFromOutbox(id);
  //               });
  //             }
  //           });
  //         });
  //       });
  //     });

  //     ordersInOutbox.forEach(order => {
  //       debugger;
  //       // const id = _order.id;
  //       // delete _order.id;
  //     });
  // }

  // ToDo
  // Wenn Offline order erstellt wird und man auf detail seite weiter geleitet wird

  public isConnected() {
    return navigator.onLine;
  }

  public navigateToOrderList() {
    this.router.navigate(['/']);
  }

  public toastMessageShowSuccess() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.success('Erfolgreich erstellt', 'Auftrag', successConfig);
  }

  public toastMessageRecordAlreadyExists() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.error('Existiert bereits', 'Auftrag', successConfig);
  }

  public createOrder(formInput: any) {
    this.newOrder = new Order(
      formInput.companyName,
      formInput.location,
      new Date(),
      formInput.contactPerson
    );
    this.newOrder.records = [];

    this.createOrderIfOffline();

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
                this.toastMessageShowSuccess();
                this.isAlreadyInFirestore = true;
                this.router.navigate(['/order-details/' + id]);
                return;
              })
              .catch(e => {
                console.error('can´t create order to firebase', e);
              });
          } else {
            this.toastMessageRecordAlreadyExists();
            return;
          }
        } else {
          this.cloudFirestoreService
            .addOrder(this.newOrder)
            .then(id => {
              this.toastMessageShowSuccess();
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

  public createOrderIfOffline() {
    // check if new order is already in indexedDB orderOutbox
    // if not, add to outbox otherwise ignore
    // wenn mit server synchronisiert wird, muss indexedDB id durch firebase id ersetzt werden
    this.indexDbService.getOrdersFromOutbox().then(ordersInOutbox => {
      if (ordersInOutbox !== undefined) {
        if (ordersInOutbox.length !== 0) {
          const orders = [];
          const newOrder = {
            companyName: this.newOrder.companyName,
            location: this.newOrder.location,
            contactPerson: this.newOrder.contactPerson
          };

          ordersInOutbox.forEach(order => {
            orders.push({
              companyName: order.companyName,
              location: order.location,
              contactPerson: order.contactPerson
            });
          });
          this.isAlreadyInOutbox = _.findIndex(orders, o => _.isMatch(o, newOrder)) > -1;
          if (!this.isAlreadyInOutbox) {
            this.indexDbService.addOrderToOutbox(this.newOrder);
            this.isAlreadyInOutbox = true;
          } else {
            this.toastMessageRecordAlreadyExists();
          }
        } else {
          this.indexDbService.addOrderToOutbox(this.newOrder).then(() => {
            this.toastMessageShowSuccess();
          });
        }
        this.isAlreadyInOutbox = true;
      }
    });
  }

  // Mittelteil wenn kontrolliert wurde ob bereits in firebase

  // this.ordersObs.subscribe(_orders => {
  //   this.orders = _orders;
  //   if (this.orders.length !== 0) {
  //     this.orders.forEach(order => {
  //       this.indexDbService.getAllOrders().then(ordersInIndexedDB => {
  //         ordersInIndexedDB.forEach(cachedOrder => {
  //           this.orderIds.push(cachedOrder.id);
  //         });
  //         this.orders.forEach(_order => {
  //           if (!this.orderIds.includes(_order.id)) {
  //             this.cloudFirestoreService
  //               .addOrder(_order)
  //               .then(id => {
  //                 this.toastMessageShowSuccess();
  //                 this.router.navigate(['/order-details/' + id]);
  //               })
  //               .catch(e => {
  //                 console.error('can´t create order to firebase', e);
  //               });
  //           }
  //         });
  //       });
  //     });
  //   }

  public onSubmit() {
    this.createOrder(this.createOrderForm.value);
  }
}
