import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, Routes, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-record-list',
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.sass']
})
export class RecordListComponent implements OnInit {
  public customers = ['Lang', 'Huber', 'Maier', 'Müller'];
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {}
}
