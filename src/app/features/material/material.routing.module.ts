import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaterialComponent } from './material.component';
import { CreateMaterialComponent } from './create-material/create-material.component';
import { EditMaterialComponent } from './edit-material/edit-material.component';

const routes: Routes = [
  {
    path: '',
    component: MaterialComponent,
    pathMatch: 'full',
  },
  {
    path: 'materials/create',
    component: CreateMaterialComponent,
  },
  {
    path: 'materials/edit',
    component: EditMaterialComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaterialRoutingModule {}
