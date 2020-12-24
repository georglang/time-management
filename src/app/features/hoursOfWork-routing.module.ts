import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateOrderComponent } from './hoursOfWork/create-order/create-order.component';
import { OrderListComponent } from './hoursOfWork/order-list/order-list.component';
import { EditOrderComponent } from './hoursOfWork/edit-order/edit-order.component';
import { CreateEntryComponent } from './hoursOfWork/create-entry/create-entry.component';
import { EditRecordComponent } from './hoursOfWork/edit-record/edit-record.component';
import { OrderDetailComponent } from './hoursOfWork/order-detail/order-detail.component';

const routes: Routes = [
  {
    path: '',
    component: OrderListComponent,
    pathMatch: 'full',
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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HoursOfWorkRoutingModule {}
