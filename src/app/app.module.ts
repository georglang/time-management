import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";

// firebase modulese
import { FirebaseOptionsToken } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";

// own modules
import { AppRoutingModule } from "./router/app.routing.module";
import { ToastrModule } from "ngx-toastr";

// pipes
import { SortFormArrayByDate } from "./pipes/sort-form-array-by-date.pipe";

// Angular Material
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatNativeDateModule, MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCheckboxModule } from "@angular/material/checkbox";

// services
import { FirestoreOrderService } from "./service/firestore-order-service/firestore-order.service";
import { FirestoreRecordService } from "./service/firestore-record-service/firestore-record.service";
import { IndexedDBService } from "./service/indexedDb-service/indexedDb.service";
import { SynchronizeIdxDBWithFirebaseService } from "./service/synchronize-idxDb-with-firebase-service/synchronize-idxDb-with-firebase.service";

// components
import { OrderListComponent } from "./order-list/order-list.component";
import { HeaderComponent } from "./header/header.component";
import { Database } from "./database/Database";
import { CreateOrderComponent } from "./create-order/create-order.component";
import { OrderDetailComponent } from "./order-detail/order-detail.component";
import { EditRecordComponent } from "./edit-record/edit-record.component";
import { CreateRecordComponent } from "./create-record/create-record.component";
import { ConfirmDeleteDialogComponent } from "./confirm-delete-dialog/confirm-delete-dialog.component";
import { MatSelectModule } from "@angular/material/select";
import { FooterComponent } from './footer/footer.component';

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
      FooterComponent
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
    MatCheckboxModule,
    MatSelectModule,
    ToastrModule.forRoot(),
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
    AngularFirestoreModule,
  ],
  providers: [
    IndexedDBService,
    SynchronizeIdxDBWithFirebaseService,
    FirestoreOrderService,
    FirestoreRecordService,
    Database,
    SortFormArrayByDate,
    {
      provide: FirebaseOptionsToken,
      useValue: environment.firebase,
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: "de-DE",
    },
  ],
  entryComponents: [ConfirmDeleteDialogComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
