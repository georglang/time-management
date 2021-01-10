import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app/app.component';

import { environment } from 'src/environments/environment.prod';

import { AppRoutingModule } from './app.routing.module';

// modules
import { ToastrModule } from 'ngx-toastr';
import { AngularMaterialModule } from './shared/modules/angular-material.module';
import { WorkingHourModule } from './features/working-hour/working-hour.module';

// components
import { NoConnectionSnackBarComponent } from './app/noConnectionSnackBar/noConnectionSnackBar.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { SignInComponent } from './core/auth/sign-in/sign-in.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent, SignInComponent, NoConnectionSnackBarComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    WorkingHourModule,
    ToastrModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
