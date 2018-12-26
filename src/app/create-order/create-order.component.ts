import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { Order } from '../data-classes/order';
import { ToastrService } from 'ngx-toastr';
import { CloudFirestoreService } from './../service/cloud-firestore.service';
import { TimeRecord } from '../data-classes/time-record';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.sass']
})
export class CreateOrderComponent implements OnInit {
  public createOrderForm: FormGroup;
  public columns: string[];
  private isOnline;

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

  public addOrder(formInput: any) {

    const newOrder = new Order(
      formInput.companyName,
      formInput.location,
      new Date(),
      '',
      formInput.contactPerson
    );

    console.log('newOrder', newOrder);

    if (!newOrder.hasOwnProperty('records')) {
      newOrder.records = [];
    }


    if (this.isConnected()) {
      this.firebaseService
        .addOrder(newOrder)
        .then(id => {
          console.log('Document written with ID: ', id);
          this.showSuccess();
          this.router.navigate(['/order-details/' + id]);
        })
        .catch(e => {
          console.error('can´t create order to firebase', e);
        });
    } else {
      this.indexDbService.addOrderToOutbox(newOrder);
    }
  }

  public onSubmit() {
    this.addOrder(this.createOrderForm.value);
  }
}
