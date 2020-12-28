import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HoursOfWorkListComponent } from './hours-of-work-list/hours-of-work-list.component';

const routes: Routes = [
  {
    path: '',
    component: HoursOfWorkListComponent,
    pathMatch: 'full',
    // canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HoursOfWorkRoutingModule {}
