import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TimeRecord, ITimeRecord } from '../data-classes/TimeRecords';
import { DateAdapter } from '@angular/material/core';
import { FirestoreRecordService } from '../service/firestore-record-service/firestore-record.service';
import { MessageService } from '../service/message-service/message.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-record',
  templateUrl: './edit-record.component.html',
  styleUrls: ['./edit-record.component.sass'],
})
export class EditRecordComponent implements OnInit {
  public editRecordForm: FormGroup;
  private recordId: string;
  private orderId: string;
  public record: ITimeRecord;
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
      value: 'Strobel Martin',
      viewValue: 'Strobel Martin',
    },
    {
      value: 'Tschabi Matthias',
      viewValue: 'Tschabi Matthias',
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    private firestoreRecordService: FirestoreRecordService,
    private messageService: MessageService,
    private toastrService: ToastrService
  ) {
    this.dateAdapter.setLocale('de');
  }

  ngOnInit() {
    this.editRecordForm = this.formBuilder.group({
      id: [''],
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: [0, Validators.required],
      employee: ['', Validators.required],
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
              this.record = new TimeRecord(
                record.date,
                record.description,
                record.workingHours,
                record.employee,
                record.id,
                record.orderId,
                record.hasBeenPrinted
              );
              this.setControl(this.record);
            }
          });
        }
      });
    this.subscription.add(getRecordByOrderId);
  }

  public navigateToOrderList(): void {
    this.router.navigate(['/order-details', this.orderId]);
  }

  public setControl(record: ITimeRecord): void {
    let date;

    if (record.date.seconds !== undefined) {
      date = record.date.toDate();
    } else {
      date = record.date;
    }

    this.editRecordForm.setValue({
      id: record.id,
      date: date,
      description: record.description,
      workingHours: record.workingHours,
      employee: record.employee,
    });
  }

  get getFormControl() {
    return this.editRecordForm.controls;
  }

  public onSubmit() {
    const record = new TimeRecord(
      this.editRecordForm.controls.date.value,
      this.editRecordForm.controls.description.value,
      this.editRecordForm.controls.workingHours.value,
      this.editRecordForm.controls.employee.value,
      this.recordId,
      this.orderId,
      this.record.hasBeenPrinted
    );
    // this.setControl(record);

    this.submitted = true;
    if (this.editRecordForm.invalid) {
      return;
    } else {
      this.checkIfRecordExistsInOrderInFirestore(record);
    }
  }

  private checkIfRecordExistsInOrderInFirestore(record: ITimeRecord) {
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

  private updateRecordInFirestore(orderId: string, record: ITimeRecord): void {
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
