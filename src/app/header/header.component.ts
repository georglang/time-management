import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  public navLinks = [
    { path: '', label: 'Aufträge' },
    { path: '/create-order', label: 'Neuer Auftrag' },
    { path: '/create-record', label: 'Neuer Eintrag' },
    { path: '/search', label: 'Suchen' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
