import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TimeRecord } from '../data-classes/TimeRecords';
import { FirestoreRecordService } from '../service/firestore-record-service/firestore-record.service';
import { MessageService } from '../service/message-service/message.service';

@Component({
  selector: 'app-create-record',
  templateUrl: './create-record.component.html',
  styleUrls: ['./create-record.component.sass'],
})
export class CreateRecordComponent implements OnInit {
  public createRecordForm: FormGroup;
  private routeParamOrderId;
  public selectedEmployee;
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
      value: 'Strobel Martin',
      viewValue: 'Strobel Martin',
    },
    {
      value: 'Tschabi Matthias',
      viewValue: 'Tschabi Matthias',
    },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private firestoreRecordService: FirestoreRecordService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.createRecordForm = this.formBuilder.group({
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: ['', Validators.required],
      employee: ['', Validators.required],
    });

    this.route.params.subscribe((params) => {
      this.routeParamOrderId = params.id;
    });
  }

  public navigateToOrderList() {
    this.router.navigate(['/order-details', this.routeParamOrderId]);
  }

  public createRecord(formInput: any, orderId: string): void {
    const record = new TimeRecord(
      formInput.date,
      formInput.description,
      formInput.workingHours,
      formInput.employee,
      '',
      '',
      false
    );
    record.orderId = orderId;
    this.addRecordToFirebaseRecordsTable(record);
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
                this.messageService.recordCreatedSuccessfully();
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
    return this.createRecordForm.controls;
  }

  public onSubmit() {
    this.submitted = true;
    if (this.createRecordForm.invalid) {
      return;
    } else {
      this.createRecord(this.createRecordForm.value, this.routeParamOrderId);
    }
  }
}
