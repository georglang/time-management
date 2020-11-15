import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ConnectionService } from 'ng-connection-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoConnectionSnackBarComponent } from './noConnectionSnackBar/noConnectionSnackBar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  public isOnline = true;
  constructor(
    private swUpdate: SwUpdate,
    private connectionService: ConnectionService,
    private noConnectionSnackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm('Neue App-Version verfügbar. Herunterladen?')) {
          window.location.reload();
        }
      });
    }

    this.isOnline = navigator.onLine;

    if (!this.isOnline) {
      this.openNoConnectionSnackBar();
    }

    this.connectionService.monitor().subscribe((isConnected) => {
      this.isOnline = isConnected;
      if (!isConnected) {
        this.openNoConnectionSnackBar();
      } else {
        this.closeNoConnectionSnackBar();
      }
    });
  }

  private openNoConnectionSnackBar() {
    this.noConnectionSnackBar.openFromComponent(
      NoConnectionSnackBarComponent,
      {}
    );
  }

  private closeNoConnectionSnackBar() {
    this.noConnectionSnackBar.dismiss();
  }
}
