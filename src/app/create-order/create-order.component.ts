import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { Order, IOrder } from '../data-classes/order';
import { ToastrService } from 'ngx-toastr';
import { CloudFirestoreService } from './../service/cloud-firestore.service';
import { Observable } from 'rxjs';
import _ from 'lodash';
import { map } from 'rxjs/operators';

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
  private ordersObs: Observable<IOrder[]>;
  private orderIds: number[] = [];
  private orders: any[] = [];
  private ordersInFirestore: IOrder[] = [];
  private tempOrders: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private indexDbService: IndexDBService,
    private router: Router,
    private toastr: ToastrService,
    private cloudFirestoreService: CloudFirestoreService
  ) {
    this.columns = ['Firma', 'Ansprechpartner', 'Ort'];

    this.createOrderForm = this.formBuilder.group({
      companyName: ['', Validators.required],
      location: ['', Validators.required],
      contactPerson: ['']
    });
  }

  ngOnInit() { }


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

    if (this.isConnected()) {
      // check if order is already in firestore
      this.cloudFirestoreService.getDocumentsInOrdersCollection()
      .then(data => {
        this.ordersInFirestore = data;

        this.isAlreadyInFirestore = false;
        if (this.ordersInFirestore.length > 0) {
          this.ordersInFirestore.forEach(order => {
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
    } else {
      // check if new order is already in indexedDB orderOutbox
      // if not, add to outbox otherwise ignore

      // wenn mit server synchronisiert wird, muss indexedDB id durch firebase id ersetzt werden

      this.indexDbService.getOrdersFromOutbox().then(ordersInOutbox => {
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
          this.indexDbService.addOrderToOutbox(this.newOrder);
          this.toastMessageShowSuccess();
        }
        this.isAlreadyInOutbox = true;
      });
    }
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
