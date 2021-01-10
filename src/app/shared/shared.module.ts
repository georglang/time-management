import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from './modules/angular-material.module';
import { HeaderComponent } from '../features/working-hour/header/header.component';

@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, AngularMaterialModule],
  exports: [AngularMaterialModule, HeaderComponent],
  providers: [],
})
export class SharedModule {}
