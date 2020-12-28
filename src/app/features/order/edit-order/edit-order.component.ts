import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { DateAdapter } from '@angular/material/core';

import { IOrder, Order } from '../Order';
import { FirestoreWorkingHourService } from '../../working-hour/services/firestore-working-hour-service/firestore-working-hour.service';
import { FirestoreOrderService } from '../services/firestore-order-service/firestore-order.service';
import { MessageService } from '../../working-hour/services/message-service/message.service';

@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.sass'],
})
export class EditOrderComponent implements OnInit {
  public editOrderForm: FormGroup;
  private orderId: string;
  public order: IOrder;
  public submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    private firestoreOrderService: FirestoreOrderService,
    private firestoreWorkingHourService: FirestoreWorkingHourService,
    private messageService: MessageService
  ) {
    this.dateAdapter.setLocale('de');
  }

  ngOnInit() {
    this.editOrderForm = this.formBuilder.group({
      date: ['', Validators.required],
      companyName: ['', Validators.required],
      location: ['', Validators.required],
      contactPerson: ['', Validators.required],
    });

    this.route.params.subscribe((params) => {
      this.orderId = params['id'];
      this.getOrderByIdFromFirebase(this.orderId);
    });
  }

  private getOrderByIdFromFirebase(orderId: string): void {
    this.firestoreOrderService.getOrderById(orderId).then((order: IOrder) => {
      order.id = orderId;
      if (order !== undefined) {
        this.order = order;
        this.getWorkingHoursFromCloudDatabase(order);
      }
    });
  }

  private getWorkingHoursFromCloudDatabase(order: IOrder): void {
    if (this.firestoreOrderService !== undefined) {
      this.firestoreWorkingHourService
        .getWorkingHoursByOrderId(order.id)
        .subscribe((workingHours: any[]) => {
          this.order.workingHours = workingHours;
          this.setControl(order);
        });
    }
  }

  private setControl(order: IOrder): void {
    const date = order.date.toDate();
    this.editOrderForm.setValue({
      date: date,
      companyName: order.companyName,
      location: order.location,
      contactPerson: order.contactPerson,
    });
  }

  public navigateToOrderList(): void {
    this.router.navigate(['orders']);
  }

  private updateOrderInFirestore(order: IOrder): void {
    const _order = { ...order };
    if (this.firestoreOrderService !== undefined) {
      this.firestoreOrderService.updateOrder(_order).then(() => {
        this.messageService.updatedSuccessfully();
      });
    }
  }

  get getFormControl() {
    return this.editOrderForm.controls;
  }

  public onSubmit() {
    const order = new Order(
      this.editOrderForm.controls.date.value,
      this.editOrderForm.controls.companyName.value,
      this.editOrderForm.controls.location.value,
      this.editOrderForm.controls.contactPerson.value,
      this.order.workingHours,
      this.orderId
    );

    this.submitted = true;
    if (this.editOrderForm.invalid) {
      return;
    } else {
      if (order !== undefined) {
        this.updateOrderInFirestore(order);
      }
    }
  }
}
