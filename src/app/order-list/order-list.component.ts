import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

import { FirestoreOrderService } from "../service/firestore-order-service/firestore-order.service";
import { IOrder } from "../data-classes/Order";

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list.component.html",
  styleUrls: ["./order-list.component.sass"],
})
export class OrderListComponent implements OnInit {
  public orders: any[] = []; // IOrder coudn´t be used because of firebase auto generated id,
  public dataSource = new MatTableDataSource();
  public displayedColumns = ["date", "customer", "location", "detail"];
  public isOnlineService: boolean;

  @ViewChild(MatSort, { static: false })
  sort: MatSort;

  constructor(
    private router: Router,
    private firestoreOrderService: FirestoreOrderService
  ) {}

  ngOnInit() {
    this.getOrdersFromCloudDatabase();
  }

  public getOrdersFromCloudDatabase(): void {
    if (this.firestoreOrderService !== undefined) {
      this.firestoreOrderService
        .getOrdersFromOrdersCollection2()
        .subscribe((orders: IOrder[]) => {
          if (orders !== undefined) {
            this.dataSource.data = orders;
          } else {
            this.dataSource = new MatTableDataSource();
            //       // ToDo: Meldung in HTML kein Aufträge vorhanden
          }
        });
    }
  }

  public applyFilter(filterValue: string): void {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLocaleLowerCase();
    this.dataSource.filter = filterValue;
  }

  public navigateToOrder(orderId: string): void {
    this.router.navigate(["/order-details/" + orderId]);
  }

  public navigateToCreateOrder(): void {
    this.router.navigate(["/create-order"]);
  }
}
