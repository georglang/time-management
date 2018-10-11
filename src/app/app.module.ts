import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// own modules
import {AppRoutingModule} from './router/app.routing.module';


import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

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
  MatTableModule
} from '@angular/material';

// components
import { OrderListComponent } from './order-list/order-list.component';
import { CreateRecordComponent } from './create-record/create-record.component';
import { SearchComponent } from './search/search.component';
import { HeaderComponent } from './header/header.component';
import { IndexDBService } from './service/index-db.service';
import { Database } from './database/Database';
import { CreateOrderComponent } from './create-order/create-order.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    OrderListComponent,
    CreateRecordComponent,
    SearchComponent,
    HeaderComponent,
    CreateOrderComponent,
    OrderDetailComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
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
    MatTableModule
  ],
  providers: [
    IndexDBService,
    Database
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
