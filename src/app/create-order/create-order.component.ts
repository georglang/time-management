import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { Order } from '../data-classes/order';
import { ToastrService, Toast } from 'ngx-toastr';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.sass']
})
export class CreateOrderComponent implements OnInit {
  public createOrderForm: FormGroup;
  public columns: string[];

  constructor(
    private formBuilder: FormBuilder,
    private indexDbService: IndexDBService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.columns = ['Firma', 'Ansprechpartner', 'Ort'];

    this.createOrderForm = this.formBuilder.group({
      companyName: ['', Validators.required],
      location: ['', Validators.required],
      contactPerson: ['']
    });
  }

  ngOnInit() {}

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

  public addOrder(order: Order) {
    if (!order.hasOwnProperty('records')) {
      order.records = [];
    }

    this.indexDbService
      .addOrder(order)
      .then(orderId => {
        this.router.navigate(['/order-details/' + orderId]);
        this.showSuccess();
      })
      .catch(e => {
        console.error('IndexedDB add Order: ', e);
      });
  }

  public onSubmit() {
    this.addOrder(this.createOrderForm.value);
  }
}
