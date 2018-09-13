import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import * as jsPDF from 'jspdf';
import * as jquery from 'jquery';
import { DateAdapter } from '@angular/material';

@Component({
  selector: 'app-time-recording-form',
  templateUrl: './time-recording-form.component.html',
  styleUrls: ['./time-recording-form.component.sass'],
  providers: [{ provide: 'Window', useValue: window }]
})
export class TimeRecordFormComponent implements OnInit {
  public timeRecordForm: FormGroup;
  public createRecordForm: FormGroup;
  public columns: string[];

  public totalTime = 0.0;

  public form_validation_messages = {
    customer: [{ type: 'required', message: 'Bitte Kunde eintragen' }],
    description: [
      { type: 'required', message: 'Bitte Art der Arbeit eintragen' }
    ],
    time: [{ type: 'required', message: 'Bitte Stunden eintragen' }]
  };

  private specialElementHandlers = {
    '#editor': function(element, renderer) {
      console.log('Element', element);
      console.log('Renderer', renderer);
      return true;
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    @Inject('Window') private window: Window,
    private dateAdapter: DateAdapter<Date>
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

  get timeRecords() {
    // console.log('Time Records', this.timeRecordForm.get(
    //   'time_records'
    // ) as FormArray);
    return this.timeRecordForm.get('time_records') as FormArray;
  }

  public sum() {}

  // public createPdfFromJson() {
  //   const doc = new jsPDF();
  //   console.log('Test', jquery('#render-container').get(0));
  //   doc.fromHTML(jquery('#render-container').html(), 5, 5, {
  //     elementHandlers: this.specialElementHandlers
  //   });
  //   doc.save('Test.pdf');
  // }

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

  public onSubmit() {
    this.getItems();
  }

  deleteRow(index: number): void {
    this.timeRecords.removeAt(index);
  }

  public getItems() {
    // console.log('Records', this.timeRecordForm.value as FormArray);
    // console.log('Single Record', this.timeRecordForm.value
    // .time_records as FormArray);
  }

  ngOnInit() {
    this.createRecordForm = this.formBuilder.group({
      customer: []
    });

    console.log('TOTAL TIME', this.totalTime);

    this.timeRecords.valueChanges.subscribe(change => {
      let tempTotalTime = 0.0;
      change.forEach(record => {
        console.log('Value', record.time);
        tempTotalTime += record.time;
      });
      this.totalTime = tempTotalTime;
    });
  }
}
