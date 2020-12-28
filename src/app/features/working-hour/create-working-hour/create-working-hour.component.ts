import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { MessageService } from '../services/message-service/message.service';
import { FirestoreRecordService } from '../services/firestore-record-service/firestore-record.service';
import { WorkingHour } from '../WorkingHour';

@Component({
  selector: 'app-create-record',
  templateUrl: './create-working-hour.component.html',
  styleUrls: ['./create-working-hour.component.sass'],
})
export class CreateWorkingHourComponent implements OnInit {
  public createWorkingHourForm: FormGroup;
  private routeParamOrderId;
  public submitted = false;
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
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private firestoreRecordService: FirestoreRecordService,
    private messageService: MessageService,
    private location: Location
  ) {}

  ngOnInit() {
    this.createWorkingHourForm = this.formBuilder.group({
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: ['', Validators.required],
      employee: ['', Validators.required],
      tool: ['', Validators.required],
    });

    this.route.params.subscribe((params) => {
      this.routeParamOrderId = params.id;
    });
  }

  public navigateToOrderList() {
    this.location.back();
  }

  public createWorkingHour(formInput: any, orderId: string): void {
    const workingHour = new WorkingHour(
      formInput.date,
      formInput.description,
      formInput.workingHours,
      formInput.employee,
      formInput.tool,
      '',
      false
    );
    workingHour.orderId = orderId;
    this.addRecordToFirebaseRecordsTable(workingHour);
  }

  public addRecordToFirebaseRecordsTable(record: any): void {
    if (this.firestoreRecordService !== undefined) {
      // check if record is already in firestore
      this.firestoreRecordService
        .checkIfRecordExistsInOrderInFirestore(record)
        .then((isAlreadyInFirestore: boolean) => {
          if (!isAlreadyInFirestore) {
            this.firestoreRecordService
              .addTimeRecord(record)
              .then((id: string) => {
                this.messageService.workingHourCreatedSuccessfully();
                this.router.navigate(['order-details', record.orderId]);
                record.id = id;
              })
              .catch((e) => {
                console.error('can´t create record to firebase', e);
              });
          } else {
            this.messageService.recordAlreadyExists();
          }
        });
    }
  }

  get getFormControl() {
    return this.createWorkingHourForm.controls;
  }

  public onSubmit() {
    this.submitted = true;
    if (this.createWorkingHourForm.invalid) {
      return;
    } else {
      this.createWorkingHour(
        this.createWorkingHourForm.value,
        this.routeParamOrderId
      );
    }
  }
}
