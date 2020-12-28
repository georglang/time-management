import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { DateAdapter } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { WorkingHour, IWorkingHour } from '../WorkingHour';
import { MessageService } from '../services/message-service/message.service';
import { FirestoreWorkingHourService } from '../services/firestore-working-hour-service/firestore-working-hour.service';

@Component({
  selector: 'app-edit-working-hour',
  templateUrl: './edit-working-hour.component.html',
  styleUrls: ['./edit-working-hour.component.sass'],
})
export class EditWorkingHourComponent implements OnInit {
  public editWorkingHourForm: FormGroup;
  private workingHourId: string;
  private orderId: string;
  public workingHour: IWorkingHour;
  public submitted = false;
  private subscription: Subscription = new Subscription();

  public employees = [
    {
      value: 'Erle Wastl',
      viewValue: 'Erle Wastl',
    },
    {
      value: 'Greisl Martin',
      viewValue: 'Greisl Martin',
    },
    {
      value: 'Martin Johann',
      viewValue: 'Martin Johann',
    },
    {
      value: 'Speer Leonhard',
      viewValue: 'Speer Leonhard',
    },
    {
      value: 'Strobel Michael',
      viewValue: 'Strobel Michael',
    },
    {
      value: 'Tschabi Matthias',
      viewValue: 'Tschabi Matthias',
    },
  ];

  public tools = [
    {
      value: 'Mann',
      viewValue: 'Mann',
    },
    {
      value: 'Mann mit Motorsäge',
      viewValue: 'Mann mit Motorsäge',
    },
    {
      value: 'Seilschlepper',
      viewValue: 'Seilschlepper',
    },
    {
      value: 'Schlepper + Rückewagen',
      viewValue: 'Schlepper + Rückewagen',
    },
    {
      value: 'HSM',
      viewValue: 'HSM',
    },
    {
      value: 'HSM + Woody',
      viewValue: 'HSM + Woody',
    },
    {
      value: 'Rückezug',
      viewValue: 'Rückezug',
    },
    {
      value: 'Rückezug + Winde + Bänder',
      viewValue: 'Rückezug + Winde + Bänder',
    },
    {
      value: 'Harvester',
      viewValue: 'Harvester',
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    private firestoreWorkingHourService: FirestoreWorkingHourService,
    private messageService: MessageService,
    private toastrService: ToastrService,
    private location: Location
  ) {
    this.dateAdapter.setLocale('de');
  }

  ngOnInit() {
    this.editWorkingHourForm = this.formBuilder.group({
      id: [''],
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: [0, Validators.required],
      employee: ['', Validators.required],
      tool: ['', Validators.required],
    });

    this.route.parent.url.subscribe((urlPath) => {
      this.orderId = urlPath[1].path;
    });

    this.route.params.subscribe((params) => {
      this.workingHourId = params['id'];
      this.getWorkingHourByIdFromFirebase(this.orderId, this.workingHourId);
    });
  }

  private getWorkingHourByIdFromFirebase(
    orderId: string,
    workingHourId: string
  ): void {
    const getWorkingHourById$ = this.firestoreWorkingHourService
      .getWorkingHourById(orderId)
      .subscribe(() => {});

    this.subscription.add(getWorkingHourById$);

    const getWorkingHourByOrderId = this.firestoreWorkingHourService
      .getWorkingHoursByOrderId(orderId)
      .subscribe((workingHours: any[]) => {
        if (workingHours !== undefined) {
          workingHours.forEach((workingHour) => {
            if (workingHour.id === workingHourId) {
              this.workingHour = new WorkingHour(
                workingHour.date,
                workingHour.description,
                workingHour.workingHours,
                workingHour.employee,
                workingHour.id,
                workingHour.orderId
              );
              this.setControl(this.workingHour);
            }
          });
        }
      });
    this.subscription.add(getWorkingHourByOrderId);
  }

  public navigateToWorkingHoursList(): void {
    this.location.back();
  }

  public setControl(workingHour: IWorkingHour): void {
    let date;

    if (workingHour.date.seconds !== undefined) {
      date = workingHour.date.toDate();
    } else {
      date = workingHour.date;
    }

    this.editWorkingHourForm.setValue({
      id: workingHour.id,
      date: date,
      description: workingHour.description,
      workingHours: workingHour.workingHours,
      employee: workingHour.employee,
    });
  }

  get getFormControl() {
    return this.editWorkingHourForm.controls;
  }

  public onSubmit() {
    const workingHour = new WorkingHour(
      this.editWorkingHourForm.controls.date.value,
      this.editWorkingHourForm.controls.description.value,
      this.editWorkingHourForm.controls.workingHours.value,
      this.editWorkingHourForm.controls.employee.value,
      this.workingHourId,
      this.orderId
    );
    // this.setControl(workingHour);

    this.submitted = true;
    if (this.editWorkingHourForm.invalid) {
      return;
    } else {
      this.checkIfWorkingHourExistsInOrderInFirestore(workingHour);
    }
  }

  private checkIfWorkingHourExistsInOrderInFirestore(
    workingHour: IWorkingHour
  ) {
    this.firestoreWorkingHourService
      .checkIfWorkingHourExistsInOrderInFirestore(workingHour)
      .then((doesWorkingHourExist) => {
        if (!doesWorkingHourExist) {
          this.updateWorkingHourInFirestore(this.orderId, workingHour);
        } else {
          this.messageService.workingHourAlreadyExists();
        }
      });
  }

  private updateWorkingHourInFirestore(
    orderId: string,
    workingHour: IWorkingHour
  ): void {
    if (this.firestoreWorkingHourService !== undefined) {
      this.setControl(workingHour);
      this.firestoreWorkingHourService
        .updateWorkingHour(orderId, workingHour)
        .then(() => {
          this.showUpdateMessage();
        });
    }
  }

  private showUpdateMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500,
    };
    this.toastrService.success(
      'Erfolgreich aktualisiert',
      'Eintrag',
      successConfig
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
