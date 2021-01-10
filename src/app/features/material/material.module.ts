import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialComponent } from './material.component';
import { MaterialListComponent } from './material-list/material-list.component';
import { EditMaterialComponent } from './edit-material/edit-material.component';
import { CreateMaterialComponent } from './create-material/create-material.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule, SharedModule],
  declarations: [
    MaterialComponent,
    MaterialListComponent,
    CreateMaterialComponent,
    EditMaterialComponent,
  ],
})
export class MaterialModule {}
