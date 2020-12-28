import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { MessageService } from '../services/message-service/message.service';
import { WorkingHour } from '../WorkingHour';
import { FirestoreWorkingHourService } from '../services/firestore-working-hour-service/firestore-working-hour.service';

@Component({
  selector: 'app-create-working-hour',
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
    private firestoreWorkingHourService: FirestoreWorkingHourService,
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
    this.addWorkingHourToFirebaseWorkingHourTable(workingHour);
  }

  public addWorkingHourToFirebaseWorkingHourTable(woringHour: any): void {
    if (this.firestoreWorkingHourService !== undefined) {
      // check if working hour is already in firestore
      this.firestoreWorkingHourService
        .checkIfWorkingHourExistsInOrderInFirestore(woringHour)
        .then((isAlreadyInFirestore: boolean) => {
          if (!isAlreadyInFirestore) {
            this.firestoreWorkingHourService
              .addWorkingHour(woringHour)
              .then((id: string) => {
                this.messageService.workingHourCreatedSuccessfully();
                this.router.navigate(['order-details', woringHour.orderId]);
                woringHour.id = id;
              })
              .catch((e) => {
                console.error('can´t create working hour to firebase', e);
              });
          } else {
            this.messageService.workingHourAlreadyExists();
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
