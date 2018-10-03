import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, Routes, ActivatedRoute, ParamMap } from '@angular/router';
import { IndexDBService } from '../database/index-db.service';

export interface ICustomerRecord {
  name: string;
  place: string;
}

@Component({
  selector: 'app-record-list',
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.sass']
})
export class RecordListComponent implements OnInit {
  public dataSource: ICustomerRecord[];
  public CustomerRecords: ICustomerRecord[] = [];
  public displayedColumns: string[] = ['name', 'place'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private indexDbService: IndexDBService
  ) {}

  getCustomerNameAndPlace() {
    this.indexDbService.getAllRecords().then(allRecords => {
      allRecords.forEach(record => {
        // if ('place' in record) {
          this.CustomerRecords.push({ name: record.customer, place: record.place });
        // }
        this.dataSource = this.CustomerRecords;
      });
    });
  }

  ngOnInit() {
    this.getCustomerNameAndPlace();
  }
}
