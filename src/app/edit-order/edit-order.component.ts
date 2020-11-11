import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { IOrder, Order } from "../data-classes/Order";
import { ITimeRecord } from "../data-classes/TimeRecords";

import { DateAdapter } from "@angular/material/core";

import { MessageService } from "../service/message-service/message.service";
import { ToastrService } from "ngx-toastr";
import { FirestoreOrderService } from "../service/firestore-order-service/firestore-order.service";
import { FirestoreRecordService } from "../service/firestore-record-service/firestore-record.service";

@Component({
  selector: "app-edit-order",
  templateUrl: "./edit-order.component.html",
  styleUrls: ["./edit-order.component.sass"],
})
export class EditOrderComponent implements OnInit {
  public editOrderForm: FormGroup;
  private orderId: string;
  public order: IOrder;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    private firestoreOrderService: FirestoreOrderService,
    private firestoreRecordService: FirestoreRecordService,
    private messageService: MessageService
  ) {
    this.dateAdapter.setLocale("de");
  }

  ngOnInit() {
    this.editOrderForm = this.formBuilder.group({
      date: ["", Validators.required],
      companyName: ["", Validators.required],
      location: ["", Validators.required],
      contactPerson: [""],
    });

    this.route.params.subscribe((params) => {
      this.orderId = params["id"];
      this.getOrderByIdFromFirebase(this.orderId);
    });
  }

  private getOrderByIdFromFirebase(orderId: string): void {
    this.firestoreOrderService.getOrderById(orderId).then((order: IOrder) => {
      order.id = orderId;
      if (order !== undefined) {
        this.order = order;
        this.getRecordsFromCloudDatabase(order);
      }
    });
  }

  private getRecordsFromCloudDatabase(order: IOrder): void {
    if (this.firestoreOrderService !== undefined) {
      this.firestoreRecordService
        .getRecordsByOrderId(order.id)
        .subscribe((records: ITimeRecord[]) => {
          this.order.records = records;
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
    this.router.navigate(["", this.orderId]);
  }

  public onSubmit() {
    const order = new Order(
      this.editOrderForm.controls.date.value,
      this.editOrderForm.controls.companyName.value,
      this.editOrderForm.controls.location.value,
      this.editOrderForm.controls.contactPerson.value,
      this.order.records,
      this.orderId
    );

    if (order !== undefined) {
      this.updateOrderInFirestore(order);
    }
  }

  private updateOrderInFirestore(order: IOrder): void {
    const _order = { ...order };
    if (this.firestoreOrderService !== undefined) {
      this.firestoreOrderService.updateOrder(_order).then(() => {
        this.messageService.updatedSuccessfully();
      });
    }
  }
}
