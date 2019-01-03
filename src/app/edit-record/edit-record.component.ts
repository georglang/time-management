import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IndexDBService } from './../service/index-db.service';
import { TimeRecord, ITimeRecord } from './../data-classes/time-record';
import { DateAdapter } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { CloudFirestoreService } from './../service/cloud-firestore.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private indexedDB: IndexDBService,
    private dateAdapter: DateAdapter<Date>,
    private toastrService: ToastrService,
    private cloudFirestoreService: CloudFirestoreService
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

    this.route.params.subscribe(params => {
      this.recordId = params['id'];
      console.log('Record Id', this.recordId);
    });

    this.route.parent.url.subscribe(urlPath => {
      console.log('URL PATH: ', urlPath);
      this.orderId = urlPath[1].path;
    });

    this.getOrderById(this.orderId, this.recordId);

    console.log('Record: ');
    this.getRecordById(this.orderId, this.recordId);
  }

  public isConnected() {
    return navigator.onLine;
  }

  public navigateToOrderList() {
    this.router.navigate(['/order-details', this.orderId]);
  }

  public getRecordById(orderId: string, recordId: string) {
    if (this.isConnected) {
      return this.cloudFirestoreService.getRecordById(orderId, recordId).subscribe(records => {
        records.forEach(element => {
          if (element.id === recordId) {
            this.setControl(element);
            return element;
          }
        });
      });
    } else {
      console.warn('No internet connection: Get Data from IndexedDB');
      this.indexedDB.getRecordById(orderId, recordId).then(record => {});
    }
  }

  public getOrderById(orderId: string, recordId: string) {
    this.indexedDB.getOrderById(orderId).then(order => {
      if (order.length !== 0) {
        if (order[0].hasOwnProperty('records')) {
          const _order = order[0];
          if (order !== undefined) {
            const records = order[0].records;
            if (records.length !== 0) {
              records.forEach(element => {
                if (element.id === recordId) {
                  this.setControl(element);
                  return element;
                }
              });
            }
          }
        }
      }
    });
  }

  public setControl(record: TimeRecord) {
    const date: any = record.date;
    this.editRecordForm.setValue({
      id: record.id,
      date: new Date(moment.unix(date.seconds).format('MM.DD.YYYY')),
      description: record.description,
      workingHours: record.workingHours
    });
  }

  public showSuccessMessage() {
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
      new Date(),
      this.editRecordForm.controls.id.value
    );

    this.indexedDB.updateRecord(newRecord, this.orderId).then(data => {
      this.showSuccessMessage();
      this.navigateToOrderList();
    });
  }
}
