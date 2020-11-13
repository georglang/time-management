import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms";

import { Order, IOrder } from "../data-classes/Order";

import { ToastrService } from "ngx-toastr";
import { FirestoreOrderService } from "../service/firestore-order-service/firestore-order.service";
import { ConnectionService } from "ng-connection-service";
import { MessageService } from "../service/message-service/message.service";

@Component({
  selector: "app-create-order",
  templateUrl: "./create-order.component.html",
  styleUrls: ["./create-order.component.sass"],
})
export class CreateOrderComponent implements OnInit {
  public createOrderForm: FormGroup;
  public columns: string[];
  public orders: any[]; // IOrder coudn´t be used because of firebase auto generated id,

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private firestoreOrderService: FirestoreOrderService,
    private messageService: MessageService
  ) {
    this.columns = ["Datum", "Firma", "Einsatzleiter", "Ort"];

    this.createOrderForm = this.formBuilder.group({
      date: ["", Validators.required],
      companyName: ["", Validators.required],
      location: ["", Validators.required],
      contactPerson: [""],
    });
  }

  ngOnInit() {}

  public navigateToOrderList() {
    this.router.navigate(["/"]);
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
                this.router.navigate(["/order-details/" + id]);
                order.id = id;
              })
              .catch((e) => {
                console.error("can´t create order to firebase", e);
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
