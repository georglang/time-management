import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { DateAdapter } from '@angular/material';
import { TimeRecord, ITimeRecord } from '../data-classes/time-record';
import { IOrder } from '../data-classes/order';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.sass']
})
export class OrderDetailComponent implements OnInit {
  private paramId;
  private sub;

  public timeRecordForm: FormGroup;
  public createRecordForm: FormGroup;
  public columns: string[];
  public totalTime = 0.0;
  private order: IOrder;
  public records: TimeRecord[];
  public lastId: number;
  public displayedColumns = ['date', 'description', 'workingHours'];
  public dataSource;

  public form_validation_messages = {
    description: [{ type: 'required', message: 'Bitte Art der Arbeit eintragen' }],
    workingHours: [{ type: 'required', message: 'Bitte Stunden eintragen' }]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    private indexDbService: IndexDBService
  ) {
    this.dateAdapter.setLocale('de');
    this.columns = ['Date', 'Description', 'Time', 'Delete'];

    this.timeRecordForm = this.formBuilder.group({
      time_records: this.formBuilder.array([
        this.formBuilder.group({
          id: [''],
          date: ['', Validators.required],
          description: ['', Validators.required],
          workingHours: [0, Validators.required]
        })
      ])
    });
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.paramId = +params['id']; // (+) converts string 'id' to a number
    });

    this.timeRecords.valueChanges.subscribe(change => {
      let tempTotalTime = 0.0;

      change.forEach(record => {
        tempTotalTime += record.workingHours;
      });
      this.totalTime = tempTotalTime;
    });

    this.getOrderById(this.paramId);
  }

  public navigateToOrderList() {
    this.router.navigate(['/']);
  }

  public addEmptyControl() {
    const control = <FormArray>this.timeRecordForm.controls.time_records;
    control.push(
      this.formBuilder.group({
        id: [''],
        date: ['', Validators.required],
        description: ['', Validators.required],
        workingHours: [0, Validators.required]
      })
    );
  }

  public addControl(record: TimeRecord) {
    const control = <FormArray>this.timeRecordForm.controls.time_records;
    control.push(
      this.formBuilder.group({
        id: [record.id],
        date: [record.date, Validators.required],
        description: [record.description, Validators.required],
        workingHours: [record.workingHours, Validators.required]
      })
    );
  }

  public createUniqueId() {
    const ID = () => {
      const array = new Uint32Array(8);
      window.crypto.getRandomValues(array);
      let str = '';
      for (let i = 0; i < array.length; i++) {
        str += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4);
      }
      return str;
    };
    return ID();
  }

  //
  public onSubmit(timeRecordForm: FormGroup) {
    const recordsFromFormInput = this.timeRecordForm.controls.time_records.value;
    if (recordsFromFormInput !== undefined) {
      for (let index = 0; index < recordsFromFormInput.length; index++) {
        const record = recordsFromFormInput[index];
        if (!record.hasOwnProperty('id') || record.id === '') {
          record.id = this.createUniqueId();
          this.indexDbService.addRecordToOrder(record, this.paramId);
        } else {
          this.indexDbService.modifyOrder(record, this.paramId);
        }
      }
    }
  }

  get timeRecords() {
    return this.timeRecordForm.get('time_records') as FormArray;
  }

  public deleteFormGroup(recordId: string, position: number) {
    this.indexDbService.removeRecord(recordId, this.paramId).then(data => {
      this.timeRecords.removeAt(position);
    });
  }

  public getOrders() {
    this.indexDbService.getAllOrders().then(data => {});
  }

  public getOrderById(orderId) {
    this.indexDbService.getOrderById(orderId).then(order => {
      console.log('Order', order[0]);
      if (order.length !== 0) {
        if (order[0].hasOwnProperty('records')) {
          this.order = order[0];
          this.records = order[0].records;

          this.dataSource = new MatTableDataSource<ITimeRecord>(this.records);

          console.log('Records', this.records);

          console.log('Data Source', this.dataSource);


          if (this.records.length > 0) {
            this.records.forEach(record => {
              this.addControl(record);
            });
          }
        }
      }
    });
  }
}
