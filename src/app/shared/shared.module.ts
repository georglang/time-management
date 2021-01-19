import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from './modules/angular-material.module';
import { HeaderComponent } from '../features/working-hour/header/header.component';

@NgModule({
  imports: [CommonModule, AngularMaterialModule],
  declarations: [HeaderComponent],
  exports: [AngularMaterialModule, HeaderComponent],
  providers: [],
})
export class SharedModule {}
