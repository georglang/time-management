import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private toastr: ToastrService) {}

  public orderCreatedSuccessful() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.success('Erfolgreich erstellt', 'Auftrag', successConfig);
  }

  public orderAlreadyExists() {
    const errorConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.error('Existiert bereits', 'Auftrag', errorConfig);
  }

  public recordAlreadyExists() {
    const errorConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.error('Existiert bereits', 'Eintrag', errorConfig);
  }

  public recordDoesNotExist() {
    const errorConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.error('Nicht gefunden', 'Eintrag', errorConfig);
  }

  public recordCreatedSuccessfully() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.success('Erfolgreich erstellt', 'Eintrag', successConfig);
  }

  public recordUpdatedSuccessfully() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.success('Erfolgreich aktualisiert', 'Eintrag', successConfig);
  }

  public recordCouldNotBeUpdated() {
    const warningConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500
    };
    this.toastr.warning('Konnte nicht aktualisiert werden', 'Eintrag', warningConfig);
  }

  public recordDeletedSuccessful() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500
    };
    this.toastr.success('Erfolgreich gelöscht', 'Eintrag', successConfig);
  }
}
