import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkingHourListComponent } from './working-hour-list/working-hour-list.component';

const routes: Routes = [
  {
    path: '',
    component: WorkingHourListComponent,
    pathMatch: 'full',
    // canActivate: [AuthGuard],
  },
  // {
  //   path: 'working-hours',
  //   component: WorkingHourListComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkingHourRoutingModule {}
