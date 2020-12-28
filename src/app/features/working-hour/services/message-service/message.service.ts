import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private toastr: ToastrService) {}

  public orderCreatedSuccessful() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000,
    };
    this.toastr.success('Erfolgreich angelegt', 'Auftrag', successConfig);
  }

  public orderAlreadyExists() {
    const errorConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000,
    };
    this.toastr.error('Existiert bereits', 'Auftrag', errorConfig);
  }

  public workingHourAlreadyExists() {
    const errorConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000,
    };
    this.toastr.error('Existiert bereits', 'Eintrag', errorConfig);
  }

  public materialAlreadyExists() {
    const errorConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000,
    };
    this.toastr.error('Existiert bereits', 'Material', errorConfig);
  }

  public workingHourDoesNotExist() {
    const errorConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000,
    };
    this.toastr.error('Nicht gefunden', 'Eintrag', errorConfig);
  }

  public workingHourCreatedSuccessfully() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000,
    };
    this.toastr.success('Erfolgreich angelegt', 'Eintrag', successConfig);
  }

  public updatedSuccessfully() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000,
    };
    this.toastr.success('Erfolgreich aktualisiert', 'Eintrag', successConfig);
  }

  public workingHourCouldNotBeUpdated() {
    const warningConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500,
    };
    this.toastr.warning(
      'Konnte nicht aktualisiert werden',
      'Eintrag',
      warningConfig
    );
  }

  public deletedSucessfull() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500,
    };
    this.toastr.success('Erfolgreich gelöscht', 'Eintrag', successConfig);
  }

  public materialCreatedSuccessfully() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000,
    };
    this.toastr.success('Erfolgreich angelegt', 'Material', successConfig);
  }
}
