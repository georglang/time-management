import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { MaterialComponent } from './material.component';
import { MaterialListComponent } from './material-list/material-list.component';
import { EditMaterialComponent } from './edit-material/edit-material.component';
import { CreateMaterialComponent } from './create-material/create-material.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule],
  declarations: [
    MaterialComponent,
    MaterialListComponent,
    CreateMaterialComponent,
    EditMaterialComponent,
  ],
})
export class MaterialModule {}
