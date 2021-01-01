import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialComponent } from './material.component';
import { MaterialListComponent } from './material-list/material-list.component';
import { EditMaterialComponent } from './edit-material/edit-material.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    MaterialComponent,
    MaterialListComponent,
    EditMaterialComponent,
  ],
})
export class MaterialModule {}