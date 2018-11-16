import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IndexDBService } from './../service/index-db.service';
import { TimeRecord } from './../data-classes/time-record';
import { DateAdapter } from '@angular/material';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-record',
  templateUrl: './edit-record.component.html',
  styleUrls: ['./edit-record.component.sass']
})
export class EditRecordComponent implements OnInit {
  public editRecordForm: FormGroup;
  private recordId: string;
  private orderId: number;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private indexedDB: IndexDBService,
    private dateAdapter: DateAdapter<Date>,
    private toastrService: ToastrService
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
      this.orderId = parseInt(url, 10);
    });

    this.getOrderById(this.orderId, this.recordId);
    this.getRecordById(this.orderId, this.recordId);
  }

  public navigateToOrderList() {
    this.router.navigate(['/order-details', this.orderId]);
  }

  public getRecordById(orderId: number, recordId: string) {
    this.indexedDB.getRecordById(orderId, recordId).then(record => {});
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

  public showSuccessMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500
    };
    this.toastrService.success('Erfolgreich aktualisiert', 'Eintrag', successConfig);
  }

  public onSubmit(editRecordForm: FormGroup) {
    const newRecord = new TimeRecord(
      this.editRecordForm.controls.date.value,
      this.editRecordForm.controls.description.value,
      this.editRecordForm.controls.workingHours.value,
      this.editRecordForm.controls.id.value
    );

    this.indexedDB.updateRecord(newRecord, this.orderId).then(data => {
      this.showSuccessMessage();
      this.navigateToOrderList();
    });
  }
}
