import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { Order, IOrder } from '../data-classes/order';
import { ToastrService } from 'ngx-toastr';
import { CloudFirestoreService } from './../service/cloud-firestore.service';
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
  private orderIds: number[] = [];
  private isAlreadyInOutbox = true;

  constructor(
    private formBuilder: FormBuilder,
    private indexDbService: IndexDBService,
    private router: Router,
    private toastr: ToastrService,
    private firebaseService: CloudFirestoreService
  ) {
    this.columns = ['Firma', 'Ansprechpartner', 'Ort'];

    this.createOrderForm = this.formBuilder.group({
      companyName: ['', Validators.required],
      location: ['', Validators.required],
      contactPerson: ['']
    });
  }

  ngOnInit() {}

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
      this.firebaseService
        .addOrder(this.newOrder)
        .then(id => {
          this.toastMessageShowSuccess();
          this.router.navigate(['/order-details/' + id]);
        })
        .catch(e => {
          console.error('can´t create order to firebase', e);
        });
    } else {
      // check if new record is already in indexedDB outbox
      // if not, add to outbox otherwise ignore
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

  public onSubmit() {
    this.createOrder(this.createOrderForm.value);
  }
}
