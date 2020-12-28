import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Order, IOrder } from '../../hoursOfWork/data-classes/Order';
import { FirestoreOrderService } from '../../hoursOfWork/services/firestore-order-service/firestore-order.service';
import { MessageService } from '../../hoursOfWork/services/message-service/message.service';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.sass'],
})
export class CreateOrderComponent implements OnInit {
  public createOrderForm: FormGroup;
  public columns: string[];
  public orders: any[]; // IOrder coudn´t be used because of firebase auto generated id,
  public submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private firestoreOrderService: FirestoreOrderService,
    private messageService: MessageService
  ) {
    this.columns = ['Datum', 'Firma', 'Einsatzleiter', 'Ort'];

    this.createOrderForm = this.formBuilder.group({
      date: ['', Validators.required],
      companyName: ['', Validators.required],
      location: ['', Validators.required],
      contactPerson: ['', Validators.required],
    });
  }

  ngOnInit() {}

  public navigateToOrderList() {
    this.router.navigate(['orders']);
  }

  public createOrder(formInput: any): void {
    const order = new Order(
      formInput.date,
      formInput.companyName,
      formInput.location,
      formInput.contactPerson
    );
    order.records = [];
    this.addOrderToFirebaseOrdersTable(order);
  }

  public addOrderToFirebaseOrdersTable(order: IOrder): void {
    if (this.firestoreOrderService !== undefined) {
      this.firestoreOrderService
        .checkIfOrderExists(order)
        .then((isAlreadyInFirestore: boolean) => {
          if (!isAlreadyInFirestore) {
            this.firestoreOrderService
              .addOrder(order)
              .then((id: string) => {
                this.messageService.orderCreatedSuccessful();
                this.router.navigate(['orders']);
                order.id = id;
              })
              .catch((e) => {
                console.error('can´t create order to firebase', e);
              });
          } else {
            this.messageService.orderAlreadyExists();
            return;
          }
        });
    }
  }

  get getFormControl() {
    return this.createOrderForm.controls;
  }

  public onSubmit() {
    this.submitted = true;
    if (this.createOrderForm.invalid) {
      return;
    } else {
      this.createOrder(this.createOrderForm.value);
    }
  }
}
