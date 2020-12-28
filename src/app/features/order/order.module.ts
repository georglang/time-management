import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainModule } from 'src/app/shared/modules/main.module';
import { AngularMaterialModule } from 'src/app/shared/modules/angular-material.module';

import { OrderRoutingModule } from './order-routing.module';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { CreateOrderComponent } from './create-order/create-order.component';
import { EditOrderComponent } from './edit-order/edit-order.component';
import { LazyLoadedTabNavigationComponent } from 'src/app/shared/components/lazy-loaded-tab-navigation/lazy-loaded-tab-navigation.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MainModule,
    OrderRoutingModule,
    AngularMaterialModule,
  ],
  declarations: [
    OrderListComponent,
    OrderDetailComponent,
    CreateOrderComponent,
    EditOrderComponent,
    LazyLoadedTabNavigationComponent,
  ],
})
export class OrderModule {}
