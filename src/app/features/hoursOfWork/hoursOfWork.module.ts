import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoursOfWorkComponent } from './hoursOfWork.component';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { FIREBASE_OPTIONS } from '@angular/fire';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { AngularFirestoreModule } from '@angular/fire/firestore';

// services
import { FirestoreOrderService } from './services/firestore-order-service/firestore-order.service';
import { FirestoreRecordService } from './services/firestore-record-service/firestore-record.service';

import { SortFormArrayByDate } from '../../shared/pipes/sort-form-array-by-date.pipe';
import { CreateEntryComponent } from './create-entry/create-entry.component';
import { EditRecordComponent } from './edit-record/edit-record.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { environment } from '../../../environments/environment.prod';
import { MainModule } from 'src/app/shared/modules/main.module';
import { HoursOfWorkRoutingModule } from './hoursOfWork-routing.module';

@NgModule({
  imports: [
    CommonModule,
    MainModule,
    HoursOfWorkRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFirestoreModule,
    MaterialModule,
  ],
  declarations: [
    HoursOfWorkComponent,
    SortFormArrayByDate,
    CreateEntryComponent,
    EditRecordComponent,
    ConfirmDeleteDialogComponent,
    SettingsDialogComponent,
    EditMaterialComponent,
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
})
export class HoursOfWorkModule {}
