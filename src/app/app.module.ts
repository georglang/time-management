import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app.routing.module';

// modules
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from './core/material/material.module';
import { HoursOfWorkModule } from './features/hoursOfWork/hoursOfWork.module';

// components
import { NoConnectionSnackBarComponent } from './app/noConnectionSnackBar/noConnectionSnackBar.component';

@NgModule({
  declarations: [AppComponent, NoConnectionSnackBarComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MaterialModule,
    HoursOfWorkModule,
    ToastrModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
