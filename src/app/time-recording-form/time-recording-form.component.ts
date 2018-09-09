import { Component, OnInit } from '@angular/core';
import { TimeRecording } from '../time-recording';
import { DateAdapter } from '@angular/material';

@Component({
  selector: 'app-time-recording-form',
  templateUrl: './time-recording-form.component.html',
  styleUrls: ['./time-recording-form.component.css']
})
export class TimeRecordingFormComponent implements OnInit {
  constructor(private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('de');
  }

  public model = new TimeRecording('Lang', '2/10/2018', 'Ausschneiden', '1,5');

  public onSubmit() {
    console.log('Model', this.model);

  }

  ngOnInit() {}
}
