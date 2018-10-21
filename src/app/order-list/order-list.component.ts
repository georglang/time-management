import { Component, OnInit } from '@angular/core';
import { IndexDBService } from '../service/index-db.service';
import { Order } from './../data-classes/order';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.sass']
})
export class OrderListComponent implements OnInit {
  public orders: Order[];
  public OrderRecords: Order[] = [];

  constructor(private indexDbService: IndexDBService) {}

  getOrders() {
    this.indexDbService.getAllOrders().then(allOrders => {
      if (allOrders !== undefined) {
        allOrders.forEach(order => {
          this.OrderRecords.push(new Order(order.companyName, order.location, order.contactPerson, order.id));
        });
      }
      this.orders = this.OrderRecords;
    });
  }

  ngOnInit() {
    this.getOrders();
  }
}
