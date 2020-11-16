import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { IOrder } from '../data-classes/Order';
import { FirestoreOrderService } from '../services/firestore-order-service/firestore-order.service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.sass'],
})
export class OrderListComponent implements OnInit {
  public orders: any[] = []; // IOrder coudn´t be used because of firebase auto generated id,
  public dataSource = new MatTableDataSource();
  public displayedColumns = ['date', 'customer', 'location'];
  public isOnlineService: boolean;
  public highlighted = new SelectionModel<IOrder>(false, []);
  public selectedOrder: IOrder;
  public showButtonsIfOrderIsSelected: boolean = false;
  public showDeleteButton: boolean = false;

  @ViewChild(MatSort, { static: false })
  sort: MatSort;

  constructor(
    private router: Router,
    private firestoreOrderService: FirestoreOrderService,
    public dialog: MatDialog
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
            const ordersSortedByDate = orders.sort(
              (a, b) => b.date.toMillis() - a.date.toMillis()
            );
            this.dataSource = new MatTableDataSource(ordersSortedByDate);
          } else {
            this.dataSource = new MatTableDataSource();
          }
        });
    }
  }

  public showActionButtons(selectedOrder: IOrder) {
    this.selectedOrder = selectedOrder;
    if (this.highlighted.selected.length == 0) {
      this.showButtonsIfOrderIsSelected = false;
    } else {
      this.showButtonsIfOrderIsSelected = true;
    }
  }

  public editOrder(order: IOrder) {
    this.router.navigate(['hours-of-work/edit-order/' + order.id]);
  }

  public deleteOrder(order: IOrder) {
    this.openDeleteOrderDialog(order.id);
  }

  public openSettingsDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(SettingsDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((shouldPrint) => {
      if (shouldPrint) {
        this.showDeleteButton = true;
      }
    });
  }

  public openDeleteOrderDialog(orderId: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(
      ConfirmDeleteDialogComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe((shouldDelete) => {
      if (shouldDelete) {
        this.deleteOrderInFirebase(orderId);
      }
    });
  }

  private deleteOrderInFirebase(orderId: string) {
    this.firestoreOrderService.deleteOrder(orderId);
  }

  public applyFilter(filterValue: string): void {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLocaleLowerCase();
    this.dataSource.filter = filterValue;
  }

  public navigateToOrder(order: IOrder): void {
    this.router.navigate(['hours-of-work/order-details/' + order.id]);
  }

  public navigateToCreateOrder(): void {
    this.router.navigate(['hours-of-work/create-order']);
  }
}
