import { NgModule } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute, ParamMap  } from '@angular/router';
import { OrderListComponent } from '../order-list/order-list.component';
import { CreateOrderComponent } from '../create-order/create-order.component';
import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { EditRecordComponent } from '../edit-record/edit-record.component';
import { CreateRecordComponent } from '../create-record/create-record.component';
import { OverviewComponent } from '../overview/overview.component';

const appRoutes = [
  { path: '', component: OrderListComponent },
  { path: 'create-order', component: CreateOrderComponent },
  {
    path: 'order-details/:id',
    children: [
      { path: 'detail', component: OrderDetailComponent},
      { path: 'create-record', component: CreateRecordComponent },
      { path: 'edit-record/:id', component: EditRecordComponent},
    ]
  },
  // * wildcard if the requested URL doesn´t match any path in the URL
  // could also be a 404 page
  //{ path: '**', component: OrderListComponent, pathMatch: 'full' }
];

// {
//   path: 'machine/:machineId',
//   component: MachineDetailsComponent,
//   children: [
//     { path: '', redirectTo: 'overview', pathMatch: 'full' },
//     { path: 'overview', component: OverviewComponent }
//     /*       {path: 'acceptance-report', component: AcceptanceReportComponent},*/
//   ]
// },

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
