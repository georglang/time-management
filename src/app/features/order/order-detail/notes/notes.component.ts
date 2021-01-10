import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.sass'],
})
export class NotesComponent implements OnInit {
  public displayedColumns = ['date', 'note'];

  constructor(private _ngZone: NgZone) {}

  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;

  public triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnInit() {}
}
