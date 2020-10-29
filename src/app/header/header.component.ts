import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  public navLinks = [
    { path: '', label: '' }
    // { path: '/create-order', label: 'Neuer Auftrag' },
    // { path: '/search', label: 'Suchen' }
  ];

  @Input() titleInput: string;

  constructor() {}

  ngOnInit() {}
}
