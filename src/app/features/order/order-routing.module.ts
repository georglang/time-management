import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { CreateOrderComponent } from './create-order/create-order.component';
import { EditOrderComponent } from './edit-order/edit-order.component';

import { CreateEntryComponent } from '../hoursOfWork/create-entry/create-entry.component';
import { EditRecordComponent } from '../hoursOfWork/edit-record/edit-record.component';
import { EditMaterialComponent } from '../hoursOfWork/edit-material/edit-material.component';
import { Order } from '../hoursOfWork/data-classes/Order';

const routes: Routes = [
  {
    path: '',
    component: OrderListComponent,
    // canActivate: [AuthGuard],
  },
  { path: 'create-order', component: CreateOrderComponent },
  { path: 'edit-order/:id', component: EditOrderComponent },
  {
    path: 'order-details/:id',
    // canActivate: [AuthGuard],
    children: [
      { path: '', component: OrderDetailComponent },
      { path: 'create-entry', component: CreateEntryComponent },
      { path: 'edit-record/:id', component: EditRecordComponent },
      { path: 'edit-material/:id', component: EditMaterialComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
