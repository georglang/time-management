import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-notes',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.sass'],
})
export class NotesListComponent implements OnInit {
  public displayedColumns = ['date', 'note'];

  constructor(private _ngZone: NgZone) {}

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  public triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit() {}
}