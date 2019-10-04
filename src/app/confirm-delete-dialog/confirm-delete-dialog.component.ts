import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.sass']
})
export class ConfirmDeleteDialogComponent implements OnInit {
  public modalTitle: string;
  constructor() {}

  ngOnInit() {}
}
