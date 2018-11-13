import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IndexDBService } from './../service/index-db.service';
import { TimeRecord } from './../data-classes/time-record';
import { DateAdapter } from '@angular/material';

@Component({
  selector: 'app-edit-record',
  templateUrl: './edit-record.component.html',
  styleUrls: ['./edit-record.component.sass']
})
export class EditRecordComponent implements OnInit {
  public editRecordForm: FormGroup;
  private recordId: string;
  private orderId: number;
  private record: TimeRecord;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private indexedDB: IndexDBService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('de');
  }

  ngOnInit() {
    this.editRecordForm = this.formBuilder.group({
      id: [''],
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: [0, Validators.required]
    });

    this.route.params.subscribe(params => {
      this.recordId = params['id'];
    });

    this.route.parent.url.subscribe(urlPath => {
      const url = urlPath[urlPath.length - 1].path;
      this.orderId = parseInt(url, 2);
    });

    if (this.recordId !== undefined && this.orderId !== undefined) {
      this.getOrderById(this.orderId, this.recordId);
    }
  }

  public navigateToOrderList() {
    this.router.navigate(['/order-details', this.orderId]);
  }

  public getOrderById(orderId: number, recordId: string) {
    this.indexedDB.getOrderById(orderId).then(order => {
      if (order.length !== 0) {
        if (order[0].hasOwnProperty('records')) {
          const _order = order[0];
          if (order !== undefined) {
            const records = order[0].records;
            if (records.length !== 0) {
              records.forEach(element => {
                if (element.id === recordId) {
                  this.setControl(element);
                  return element;
                }
              });
            }
          }
        }
      }
    });
  }

  public setControl(record: TimeRecord) {
    this.editRecordForm.controls['id'].setValue(record.id);
    this.editRecordForm.controls['date'].setValue(record.date);
    this.editRecordForm.controls['description'].setValue(record.description);
    this.editRecordForm.controls['workingHours'].setValue(record.workingHours);
  }

  onSubmit() {}
}
