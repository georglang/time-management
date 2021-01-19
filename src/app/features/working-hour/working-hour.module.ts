import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { FIREBASE_OPTIONS } from '@angular/fire';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { AngularFirestoreModule } from '@angular/fire/firestore';

// services
import { FirestoreOrderService } from '../order/services/firestore-order-service/firestore-order.service';
import { FirestoreWorkingHourService } from './services/firestore-working-hour-service/firestore-working-hour.service';

import { SortFormArrayByDate } from '../../shared/pipes/sort-form-array-by-date.pipe';
// import { CreateEntryComponent } from './create-entry/create-entry.component';
import { EditWorkingHourComponent } from './edit-working-hour/edit-working-hour.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { environment } from '../../../environments/environment.prod';
import { WorkingHourRoutingModule } from './working-hour.routing.module';
import { WorkingHourListComponent } from './working-hour-list/working-hour-list.component';
import { CreateWorkingHourComponent } from './create-working-hour/create-working-hour.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFirestoreModule,
    SharedModule,
    WorkingHourRoutingModule,
  ],
  declarations: [
    SortFormArrayByDate,
    // CreateEntryComponent,
    EditWorkingHourComponent,
    ConfirmDeleteDialogComponent,
    SettingsDialogComponent,
    CreateWorkingHourComponent,
    WorkingHourListComponent,
  ],
  providers: [
    FirestoreOrderService,
    FirestoreWorkingHourService,
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
})
export class WorkingHourModule {}
