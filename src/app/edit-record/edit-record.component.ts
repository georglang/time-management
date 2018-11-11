import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IndexDBService } from './../service/index-db.service';
import _ from 'lodash';

@Component({
  selector: 'app-edit-record',
  templateUrl: './edit-record.component.html',
  styleUrls: ['./edit-record.component.sass']
})
export class EditRecordComponent implements OnInit {
  public editRecordForm: FormGroup;
  private paramId;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private indexedDB: IndexDBService
  ) { }

  ngOnInit() {
    this.editRecordForm = this.formBuilder.group({
      id: [''],
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: [0, Validators.required]
    });

    this.route.params.subscribe(params => {
      this.paramId = +params['id'];
      console.log('Params', this.paramId);

    });

    this.route.data.subscribe(params => console.log('Params', params));

    this.getOrderById(1, this.paramId);
  }

  public navigateToOrderList() {
    this.router.navigate(['/order-details', this.paramId]);
  }

  onSubmit() {
  }

  public getOrderById(orderId, recordId) {

console.log('RecordId', recordId);


    this.indexedDB.getOrderById(1)
      .then((order => {
        const records = order[0].records;
        console.log('Records', records);

        const test = _.find(records, ['id', recordId]);
        console.log('Record', test);
        const foundRecord = records.find(record => record.id === recordId);
        console.log('Found', foundRecord);


      }));
  }

}
