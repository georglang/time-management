import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

// firebase modulese
import { FIREBASE_OPTIONS } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

// modules
import { AppRoutingModule } from './router/app.routing.module';
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from './core/material/material.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';

// pipes
import { SortFormArrayByDate } from './pipes/sort-form-array-by-date.pipe';

// services
import { FirestoreOrderService } from './service/firestore-order-service/firestore-order.service';
import { FirestoreRecordService } from './service/firestore-record-service/firestore-record.service';

// components
import { OrderListComponent } from './order-list/order-list.component';
import { HeaderComponent } from './header/header.component';
import { CreateOrderComponent } from './create-order/create-order.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { EditRecordComponent } from './edit-record/edit-record.component';
import { CreateRecordComponent } from './create-record/create-record.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';

import { EditOrderComponent } from './edit-order/edit-order.component';
import { NoConnectionSnackBarComponent } from './noConnectionSnackBar/noConnectionSnackBar.component';

@NgModule({
  declarations: [
    AppComponent,
    OrderListComponent,
    HeaderComponent,
    CreateOrderComponent,
    OrderDetailComponent,
    SortFormArrayByDate,
    EditRecordComponent,
    CreateRecordComponent,
    ConfirmDeleteDialogComponent,
    SettingsDialogComponent,
    SettingsDialogComponent,
    EditOrderComponent,
    NoConnectionSnackBarComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    ToastrModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    AngularFirestoreModule,
  ],
  providers: [
    FirestoreOrderService,
    FirestoreRecordService,
    SortFormArrayByDate,
    {
      provide: FIREBASE_OPTIONS,
      useValue: environment.firebase,
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'de-DE',
    },
  ],
  entryComponents: [ConfirmDeleteDialogComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
