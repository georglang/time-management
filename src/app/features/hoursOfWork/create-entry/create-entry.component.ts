import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { MessageService } from '../services/message-service/message.service';
import { FirestoreRecordService } from '../services/firestore-record-service/firestore-record.service';
import { TimeRecord } from '../data-classes/TimeRecords';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

@Component({
  selector: 'app-create-entry',
  templateUrl: './create-entry.component.html',
  styleUrls: ['./create-entry.component.sass'],
})
export class CreateEntryComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  public createEntryForm: FormGroup;
  public workingHoursForm: FormGroup;
  public materialForm: FormGroup;
  public noticeForm: FormGroup;

  private routeParamOrderId;
  public submitted = false;
  public optionValue: string;

  public categories = [
    {
      value: 'Stunden',
      viewValue: 'Stunden',
    },
    {
      value: 'Material',
      viewValue: 'Material',
    },
    {
      value: 'Notizen',
      viewValue: 'Notizen',
    },
  ];

  // ToDo consume employees from backend service
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

  public units = [
    {
      value: 'Stück',
      viewValue: 'Stück',
    },
    {
      value: 'kg',
      viewValue: 'kg',
    },
    {
      value: 'Paar',
      viewValue: 'Paar',
    },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private firestoreRecordService: FirestoreRecordService,
    private messageService: MessageService,
    private location: Location
  ) {
    this.createEntryForm = this.formBuilder.group({
      category: ['', Validators.required],
    });

    this.workingHoursForm = this.formBuilder.group({
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: ['', Validators.required],
      employee: ['', Validators.required],
    });

    this.materialForm = this.formBuilder.group({
      date: ['', Validators.required],
      material: ['', Validators.required],
      amount: ['', Validators.required],
      unit: ['', Validators.required],
    });

    this.noticeForm = this.formBuilder.group({
      date: ['', Validators.required],
      notice: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.routeParamOrderId = params.id;
    });

    this.createEntryForm
      .get('category')
      .valueChanges.subscribe((optionValue) => {
        this.optionValue = optionValue;
      });
  }

  public navigateToOrderList() {
    this.location.back();
  }

  public createEntry(formInput: any, orderId: string): void {
    const record = new TimeRecord(
      formInput.date,
      formInput.description,
      formInput.workingHours,
      formInput.employee,
      formInput.tool,
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
    return this.createEntryForm.controls;
  }

  public onSubmit() {
    this.submitted = true;
    if (this.createEntryForm.invalid) {
      return;
    } else {
      this.createEntry(this.createEntryForm.value, this.routeParamOrderId);
    }
  }
}
