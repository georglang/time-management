import { Component, OnInit, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { fromEvent, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  onlineEvent: Observable<Event>;
  offlineEvent: Observable<Event>;

  subscriptions: Subscription[] = [];
  connectionStatusMessage: string;
  connectionStatus: string;

  constructor(private swUpdate: SwUpdate) {}

  ngOnInit() {
    this.offlineAndOnlineHandling();
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm('Neue App-Version verfügbar. Herunterladen?')) {
          window.location.reload();
        }
      });
    }
  }

  // ToDo: Schauen, ob diese implementierung oder npm ng-connection verwenden

  // Get the online/offline status from browser window
  private offlineAndOnlineHandling() {
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');
    this.subscriptions.push(
      this.onlineEvent.subscribe(e => {
        this.connectionStatusMessage = 'Back to online';
        this.connectionStatus = 'online';
        console.log('Online...');
      })
    );
    this.subscriptions.push(
      this.offlineEvent.subscribe(e => {
        this.connectionStatusMessage = 'Connection lost! You are not connected to internet';
        this.connectionStatus = 'offline';
        console.log('Offline...');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
