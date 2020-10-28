import { Component, OnInit, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { ConnectionService } from 'ng-connection-service';
import { SynchronizeIdxDBWithFirebaseService } from './service/synchronize-idxDb-with-firebase-service/synchronize-idxDb-with-firebase.service';
// import { IndexedDBService } from './service/indexedDb-service/indexedDb.service';
import { FirestoreOrderService } from './service/firestore-order-service/firestore-order.service';
import { IOrder } from './data-classes/Order';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  constructor(
    private swUpdate: SwUpdate,
    private connectionService: ConnectionService,
    // private synchronizeFirebaseWithIdxDbService: SynchronizeIdxDBWithFirebaseService,
    // private indexedDBService: IndexedDBService,
    private firestoreOrderService: FirestoreOrderService
  ) {}

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm('Neue App-Version verfügbar. Herunterladen?')) {
          window.location.reload();
        }
      });
    }

    // Weiter hier
    // ToDo: evtl. Records outbox
    // Wichtig lokale orderId durch firebase id ersetzen

    // Connection State detection
    // IndexedDB ordersOutbox will be synchronized with firestore orders table
    // firestore orders table will be fetched
    // the orders will be pushed to IndexedDB orders table
    this.connectionService.monitor().subscribe(isConnected => {
      if (isConnected) {

        // this.synchronizeFirebaseWithIdxDbService
        //   .synchronizeIndexedDbOrdersOutboxTableWithFirebase()
        //   .then(isSynchronized => {
        //     if (isSynchronized) {
        //       this.indexedDBService.deleteAllOrders().then(() => {
        //         this.firestoreOrderService.getOrders().subscribe((orders: IOrder[]) => {
        //           this.indexedDBService.addOrdersWithRecordsToOrdersTable(orders);
        //         });
        //       });
        //     }
        //   });


      } else {
      }
    });
  }
}
