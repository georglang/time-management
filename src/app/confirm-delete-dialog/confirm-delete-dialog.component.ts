import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-confirm-delete-dialog",
  templateUrl: "./confirm-delete-dialog.component.html",
  styleUrls: ["./confirm-delete-dialog.component.sass"],
})
export class ConfirmDeleteDialogComponent implements OnInit {
  public modalTitle: string;
  public passwordCorrect: string;
  public hide = true;
  public isPasswortCorrect = false;

  public signin: FormGroup = new FormGroup({
    password: new FormControl("", [Validators.required, Validators.min(3)]),
  });

  get passwordInput() {
    return this.signin.get("password");
  }

  constructor() {}

  ngOnInit() {
    this.signin.controls["password"].valueChanges.subscribe((input) => {
      if (input === "Löwenbräu") {
        this.isPasswortCorrect = true;
      }
    });
  }
}
