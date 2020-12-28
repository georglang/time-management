import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';

import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';
import { Note } from '../Note';

@Component({
  selector: 'app-create-note',
  templateUrl: './create-note.component.html',
  styleUrls: ['./create-note.component.sass'],
})
export class CreateNoteComponent implements OnInit {
  public createNoteForm: FormGroup;
  public submitted = false;
  private routeParamOrderId;

  public displayedColumns = ['date', 'note'];

  constructor(
    private _ngZone: NgZone,
    private formBuilder: FormBuilder,
    private location: Location
  ) {}

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  public triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit() {
    this.createNoteForm = this.formBuilder.group({
      date: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  public navigateToOrderList() {
    this.location.back();
  }

  public createNote(formInput: any, orderId: string): void {
    // const record = new Note(formInput.date, formInput.description);
    // record.orderId = orderId;
    // this.addRecordToFirebaseRecordsTable(record);
  }

  public onSubmit() {
    this.submitted = true;
    if (this.createNoteForm.invalid) {
      return;
    } else {
      this.createNote(this.createNoteForm.value, this.routeParamOrderId);
    }
  }
}
