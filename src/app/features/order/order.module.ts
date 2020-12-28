import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainModule } from 'src/app/shared/modules/main.module';

import { OrderRoutingModule } from './order-routing.module';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { CreateOrderComponent } from './create-order/create-order.component';
import { EditOrderComponent } from './edit-order/edit-order.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';

@NgModule({
  imports: [CommonModule, MainModule, OrderRoutingModule, MaterialModule],
  declarations: [
    OrderListComponent,
    OrderDetailComponent,
    CreateOrderComponent,
    EditOrderComponent,
  ],
})
export class OrderModule {}
