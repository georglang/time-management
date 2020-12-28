import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
})
export class HeaderComponent implements OnInit {
  public navLinks = [
    { path: '', label: '' },
    // { path: '/create-order', label: 'Neuer Auftrag' },
    // { path: '/search', label: 'Suchen' }
  ];
  public isLoggedIn = false;

  @Input() titleInput: string;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn;

    console.log('Is Logged In: ', this.isLoggedIn);
  }

  logout() {
    this.authService.logout();
  }
}
