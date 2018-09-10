import { Component, OnInit } from '@angular/core';
import { TimeRecording } from '../time-recording';
import { DateAdapter } from '@angular/material';
import { FormBuilder, FormGroup, FormArray, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-time-recording-form',
  templateUrl: './time-recording-form.component.html',
  styleUrls: ['./time-recording-form.component.css'],
})
export class TimeRecordingFormComponent implements OnInit {

  constructor(private dateAdapter: DateAdapter<Date>, private formBuilder: FormBuilder) {
    this.dateAdapter.setLocale('de');
  }

  timeRecordingForm = this.formBuilder.group({
    customerName: ['', Validators.required],
    workDescription: ['', Validators.required],
    time: ['', Validators.required],
    aliases: this.formBuilder.array([this.formBuilder.control('')])
  });

  get aliases() {
    return this.timeRecordingForm.get('aliases') as FormArray;
  }

  public addAlias() {
    this.aliases.push(this.formBuilder.control(''));
  }

  public onSubmit() {
    console.log('Model', this.timeRecordingForm.controls.customerName.value);
  }

  ngOnInit() {}
}
