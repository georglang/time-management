import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { IndexDBService } from '../service/index-db.service';
import { Order } from './../data-classes/order';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.sass']
})
export class OrderListComponent implements OnInit {
  public orders: Order[] = [];
  public dataSource = new MatTableDataSource();
  public displayedColumns = ['customer', 'contactPerson', 'location'];

  @ViewChild(MatSort)
  sort: MatSort;

  constructor(private indexDbService: IndexDBService) {}

  public applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLocaleLowerCase();
    this.dataSource.filter = filterValue;
  }

  getOrders() {
    this.indexDbService.getAllOrders().then(allOrders => {
      allOrders.forEach(order => {
        this.orders.push(
          new Order(order.companyName, order.location, order.id, order.contactPerson)
        );
      });
      this.dataSource = new MatTableDataSource(this.orders);
    });
  }

  ngOnInit() {
    this.getOrders();
  }
}
