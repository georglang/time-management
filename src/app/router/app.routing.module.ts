import { NgModule } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute, ParamMap  } from '@angular/router';
import { OrderListComponent } from '../order-list/order-list.component';
import { CreateRecordComponent } from '../create-record/create-record.component';
import { SearchComponent } from '../search/search.component';
import { CreateOrderComponent } from '../create-order/create-order.component';
import { OrderDetailComponent } from '../order-detail/order-detail.component';

const appRoutes = [
  { path: '', component: OrderListComponent },
  { path: 'create-order', component: CreateOrderComponent },
  { path: 'create-record', component: CreateRecordComponent },
  { path: 'search', component: SearchComponent },
  { path: 'order-details/:id', component: OrderDetailComponent },
  // * wildcard if the requested URL doesn´t match any path in the URL
  // could also be a 404 page
  { path: '**', component: OrderListComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
