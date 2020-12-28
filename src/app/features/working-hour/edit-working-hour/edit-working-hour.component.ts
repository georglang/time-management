import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { DateAdapter } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { WorkingHour, IWorkingHour } from '../WorkingHour';
import { MessageService } from '../services/message-service/message.service';
import { FirestoreRecordService } from '../services/firestore-record-service/firestore-record.service';

@Component({
  selector: 'app-edit-record',
  templateUrl: './edit-working-hour.component.html',
  styleUrls: ['./edit-working-hour.component.sass'],
})
export class EditWorkingHourComponent implements OnInit {
  public editWorkingHourForm: FormGroup;
  private recordId: string;
  private orderId: string;
  public record: IWorkingHour;
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
    private firestoreRecordService: FirestoreRecordService,
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
      this.recordId = params['id'];
      this.getRecordByIdFromFirebase(this.orderId, this.recordId);
    });
  }

  private getRecordByIdFromFirebase(orderId: string, recordId: string): void {
    const getRecordById$ = this.firestoreRecordService
      .getRecordById(orderId)
      .subscribe(() => {});

    this.subscription.add(getRecordById$);

    const getRecordByOrderId = this.firestoreRecordService
      .getRecordsByOrderId(orderId)
      .subscribe((records: any[]) => {
        if (records !== undefined) {
          records.forEach((record) => {
            if (record.id === recordId) {
              this.record = new WorkingHour(
                record.date,
                record.description,
                record.workingHours,
                record.employee,
                record.id,
                record.orderId
              );
              this.setControl(this.record);
            }
          });
        }
      });
    this.subscription.add(getRecordByOrderId);
  }

  public navigateToRecordList(): void {
    this.location.back();
  }

  public setControl(record: IWorkingHour): void {
    let date;

    if (record.date.seconds !== undefined) {
      date = record.date.toDate();
    } else {
      date = record.date;
    }

    this.editWorkingHourForm.setValue({
      id: record.id,
      date: date,
      description: record.description,
      workingHours: record.workingHours,
      employee: record.employee,
    });
  }

  get getFormControl() {
    return this.editWorkingHourForm.controls;
  }

  public onSubmit() {
    const record = new WorkingHour(
      this.editWorkingHourForm.controls.date.value,
      this.editWorkingHourForm.controls.description.value,
      this.editWorkingHourForm.controls.workingHours.value,
      this.editWorkingHourForm.controls.employee.value,
      this.recordId,
      this.orderId
    );
    // this.setControl(record);

    this.submitted = true;
    if (this.editWorkingHourForm.invalid) {
      return;
    } else {
      this.checkIfRecordExistsInOrderInFirestore(record);
    }
  }

  private checkIfRecordExistsInOrderInFirestore(record: IWorkingHour) {
    this.firestoreRecordService
      .checkIfRecordExistsInOrderInFirestore(record)
      .then((doesRecordExist) => {
        if (!doesRecordExist) {
          this.updateRecordInFirestore(this.orderId, record);
        } else {
          this.messageService.recordAlreadyExists();
        }
      });
  }

  private updateRecordInFirestore(orderId: string, record: IWorkingHour): void {
    if (this.firestoreRecordService !== undefined) {
      this.setControl(record);
      this.firestoreRecordService.updateRecord(orderId, record).then(() => {
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
