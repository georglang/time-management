import { Input, Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.sass'],
})
export class SignInComponent implements OnInit {
  @Input() error: string | null;

  @Output() submitEM = new EventEmitter();
  passwordForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  public hide = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {}

  get passwordInput() {
    return this.passwordForm.get('password');
  }

  submit() {
    if (this.passwordForm.valid) {
      this.submitEM.emit(this.passwordForm.value);
      this.authService
        .signIn(
          this.passwordForm.get('email').value,
          this.passwordForm.get('password').value
        )
        .then((data) => {
          this.router.navigate(['hours-of-work']);
        });
    }
  }
}
