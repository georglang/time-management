import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TimeRecord } from '../data-classes/ITimeRecords';
import { DateAdapter } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { CloudFirestoreService } from '../service/cloudFirestore.service';
import { MessageService } from './../service/message.service';

import * as moment from 'moment';

@Component({
  selector: 'app-edit-record',
  templateUrl: './edit-record.component.html',
  styleUrls: ['./edit-record.component.sass']
})
export class EditRecordComponent implements OnInit {
  public editRecordForm: FormGroup;
  private recordId: string;
  private orderId: string;
  public formatedDate: string;
  public record: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    private toastrService: ToastrService,
    private cloudFirestoreService: CloudFirestoreService,
    private messageService: MessageService
  ) {
    this.dateAdapter.setLocale('de');
  }

  ngOnInit() {
    this.editRecordForm = this.formBuilder.group({
      id: [''],
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: [0, Validators.required]
    });

    this.route.parent.url.subscribe(urlPath => {
      this.orderId = urlPath[1].path;
    });

    this.route.params.subscribe(params => {
      this.recordId = params['id'];
      this.getRecordById(this.orderId, this.recordId);
    });

    // ToDo implement change detection notification
    this.editRecordForm.valueChanges.subscribe(changes => {
      console.log('Changes', changes);
    });
  }

  public isConnected() {
    return navigator.onLine;
  }

  public getRecordById(orderId: string, recordId: string): void {
    this.cloudFirestoreService.getRecordById(orderId, recordId).then(record => {
      this.record = record;
      if (this.record !== undefined) {
        this.setControl(this.record);
      }
    });
  }
  public navigateToOrderList() {
    this.router.navigate(['/order-details', this.orderId]);
  }

  public setControl(record: TimeRecord): void {
    const date: any = record.date;
    this.editRecordForm.setValue({
      id: this.recordId,
      date: new Date(moment.unix(date.seconds).format('MM.DD.YYYY')),
      description: record.description,
      workingHours: record.workingHours
    });
  }

  public showMessageUpdatedSuccessful() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500
    };
    this.toastrService.success('Erfolgreich aktualisiert', 'Eintrag', successConfig);
  }

  public onSubmit() {
    const newRecord = new TimeRecord(
      this.editRecordForm.controls.date.value,
      this.editRecordForm.controls.description.value,
      this.editRecordForm.controls.workingHours.value,
      this.editRecordForm.controls.id.value,
      ''
    );

    this.cloudFirestoreService
      .checkIfRecordExistsInOrderInFirestore(this.orderId, newRecord)
      .then(doesRecordExist => {
        if (!doesRecordExist) {
          this.update();
        } else {
          this.messageService.recordAlreadyExists();
        }
      });
  }

  private update() {
    this.cloudFirestoreService.ordersCollection
      .doc(this.orderId)
      .collection('records')
      .doc(this.recordId)
      .update({
        date: this.editRecordForm.controls.date.value,
        description: this.editRecordForm.controls.description.value,
        workingHours: this.editRecordForm.controls.workingHours.value,
        createdAt: new Date()
      })
      .then(() => {
        this.showMessageUpdatedSuccessful();
      });
  }
}
