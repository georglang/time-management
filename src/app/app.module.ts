import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { environment } from '../environments/environment';

// own modules
import {AppRoutingModule} from './router/app.routing.module';
import { ToastrModule } from 'ngx-toastr';

// pipes
import { SortFormArrayByDate } from './pipes/sort-form-array-by-date.pipe';


// Angular Material
import {
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatCardModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatMenuModule,
  MatToolbarModule,
  MatTabsModule,
  MatTableModule,
  MatDialogModule
} from '@angular/material';

// components
import { OrderListComponent } from './order-list/order-list.component';
import { HeaderComponent } from './header/header.component';
import { IndexDBService } from './service/index-db.service';
import { Database } from './database/Database';
import { CreateOrderComponent } from './create-order/create-order.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { EditRecordComponent } from './edit-record/edit-record.component';
import { CreateRecordComponent } from './create-record/create-record.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';

const firebaseConfig = environment.firebaseConfig;

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
    ConfirmDeleteDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatToolbarModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    ToastrModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule.enablePersistence()  ],
  providers: [
    IndexDBService,
    Database,
    SortFormArrayByDate,
  ],
  entryComponents: [
    ConfirmDeleteDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
