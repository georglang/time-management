import { Input, Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.sass'],
})
export class SignInFormComponent implements OnInit {
  @Input() error: string | null;

  @Output() submitEM = new EventEmitter();
  form: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  submit() {
    if (this.form.valid) {
      this.submitEM.emit(this.form.value);
      this.authService.signIn(
        this.form.get('email').value,
        this.form.get('password').value
      );
    }
  }
}
