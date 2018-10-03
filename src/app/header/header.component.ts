import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  public navLinks = [
    { path: '', label: 'Kunde' },
    { path: '/create-record', label: 'Neuer Auftrag' },
    { path: '/search', label: 'Suchen' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
