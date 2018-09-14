import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  public navLinks = [
    { path: '', label: 'List' },
    { path: '/create-record', label: 'Create Record' },
    { path: '/search', label: 'Search' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
