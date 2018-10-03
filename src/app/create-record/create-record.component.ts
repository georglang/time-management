import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';

import * as jsPDF from 'jspdf';
import * as jquery from 'jquery';
import { DateAdapter } from '@angular/material';
import { TimeRecord } from '../data-classes/time-record';

@Component({
  selector: 'app-create-record',
  templateUrl: './create-record.component.html',
  styleUrls: ['./create-record.component.sass'],
  providers: [{ provide: 'Window', useValue: window }]
})
export class CreateRecordComponent implements OnInit {
  public timeRecordForm: FormGroup;
  public createRecordForm: FormGroup;
  public columns: string[];
  public totalTime = 0.0;
  public title = '';

  public form_validation_messages = {
    customer: [{ type: 'required', message: 'Bitte Kunde eintragen' }],
    description: [{ type: 'required', message: 'Bitte Art der Arbeit eintragen' }],
    time: [{ type: 'required', message: 'Bitte Stunden eintragen' }]
  };

  public onDelete(id) {}

  public addRecord(record: TimeRecord) {
    this.indexDbService.addRecord(record);
    // this.addRecord.emit(this.title);
  }

  constructor(
    private formBuilder: FormBuilder,
    @Inject('Window') private window: Window,
    private dateAdapter: DateAdapter<Date>,
    private indexDbService: IndexDBService
  ) {
    this.dateAdapter.setLocale('de');
    this.columns = ['Date', 'Customer', 'Description', 'Time', 'Delete'];

    this.timeRecordForm = this.formBuilder.group({
      time_records: this.formBuilder.array([
        this.formBuilder.group({
          date: ['', Validators.required],
          customer: ['', Validators.required],
          description: ['', Validators.required],
          time: [0, Validators.required]
        })
      ])
    });
  }

  ngOnInit() {
    this.createRecordForm = this.formBuilder.group({
      customer: []
    });

    console.log('TOTAL TIME', this.totalTime);

    this.timeRecords.valueChanges.subscribe(change => {
      let tempTotalTime = 0.0;
      change.forEach(record => {
        //console.log('Value', record.time);
        tempTotalTime += record.time;
      });
      this.totalTime = tempTotalTime;
    });
  }

  public addControl() {
    const control = <FormArray>this.timeRecordForm.controls.time_records;
    control.push(
      this.formBuilder.group({
        date: ['', Validators.required],
        customer: ['', Validators.required],
        description: ['', Validators.required],
        time: [0, Validators.required]
      })
    );
    console.log('Control', control);
  }

  public onSubmit() {
    // const _tempArray = this.timeRecordForm.controls.time_records as FormArray;
    const recordsFromFormInput = this.timeRecordForm.controls.time_records.value;
    recordsFromFormInput.forEach(record => {
      this.indexDbService.addRecord(record);
    });
  }

  // Pdf Creation

  public createPdfFromJson() {
    const doc = new jsPDF();

    const teamName = jquery('#render-container')
      .find('input[name="date"]')
      .val();

    console.log('Team Name', teamName);

    doc.setFontSize(40);
    doc.text(25, 50, 'Contest Cover Page');
    doc.setFontSize(20);
    doc.text(25, 150, 'Please deliver to:');
    doc.text(25, 165, teamName);
    doc.save('team-cover.pdf');
  }

  // Database Operations

  public insertRecord() {
    console.log('Record', this.indexDbService.insertOneRecord());
  }
  get timeRecords() {
    // console.log('Time Records', this.timeRecordForm.get(
    //   'time_records'
    // ) as FormArray);
    return this.timeRecordForm.get('time_records') as FormArray;
  }

  public getRecordsFromDb() {
    // this.indexDbService. .getAllOrders();
  }

  public getItems() {
    // console.log('Records', this.timeRecordForm.value as FormArray);
    // console.log('Single Record', this.timeRecordForm.value
    // .time_records as FormArray);
  }
}
