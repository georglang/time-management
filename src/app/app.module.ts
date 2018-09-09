import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { TimeRecordingFormComponent } from './time-recording-form/time-recording-form.component';
import { GermanDateAdapter } from './GermanDateAdapter';
// Angular Material
import {
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatDatepickerModule,
  MatInputModule,
  MatNativeDateModule,
  DateAdapter
} from '@angular/material';

import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [AppComponent, TimeRecordingFormComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule
  ],
  providers: [{ provide: DateAdapter, useClass: GermanDateAdapter }],
  bootstrap: [AppComponent]
})
export class AppModule {}
