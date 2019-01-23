import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { Order, IOrder } from '../data-classes/order';
import { ToastrService } from 'ngx-toastr';
import { CloudFirestoreService } from './../service/cloud-firestore.service';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.sass']
})
export class CreateOrderComponent implements OnInit {
  public createOrderForm: FormGroup;
  public columns: string[];
  private newOrder: IOrder;

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

  public showSuccess() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.success('Erfolgreich erstellt', 'Auftrag', successConfig);
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
          this.showSuccess();
          this.router.navigate(['/order-details/' + id]);
        })
        .catch(e => {
          console.error('can´t create order to firebase', e);
        });
    } else {
      this.indexDbService.addOrderToOutbox(this.newOrder).catch(error => {
        console.error('could´t add order to outbox');
      });
    }
  }

  public onSubmit() {
    this.createOrder(this.createOrderForm.value);
  }
}
