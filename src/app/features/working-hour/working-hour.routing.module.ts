import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkingHourListComponent } from './working-hour-list/working-hour-list.component';
import { CreateWorkingHourComponent } from './create-working-hour/create-working-hour.component';
import { EditWorkingHourComponent } from './edit-working-hour/edit-working-hour.component';

const routes: Routes = [
  {
    path: '',
    component: WorkingHourListComponent,
    pathMatch: 'full',
    // canActivate: [AuthGuard],
  },
  {
    path: 'working-hours/create',
    component: CreateWorkingHourComponent,
  },
  {
    path: 'working-hours/edit',
    component: EditWorkingHourComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkingHourRoutingModule {}
