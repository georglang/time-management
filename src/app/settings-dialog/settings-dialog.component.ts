import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-setttings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.sass'],
})
export class SettingsDialogComponent implements OnInit {
  public modalTitle: string;
  public passwordCorrect: string;
  public hide = true;
  public isPasswortCorrect = false;

  public passwordForm: FormGroup = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.min(3)]),
  });

  get passwordInput() {
    return this.passwordForm.get('password');
  }

  constructor() {}

  ngOnInit() {
    this.passwordForm.controls['password'].valueChanges.subscribe((input) => {
      if (input === 'Löwenbräu') {
        this.isPasswortCorrect = true;
      }
    });
  }
}
