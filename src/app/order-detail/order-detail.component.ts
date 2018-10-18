import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { DateAdapter } from '@angular/material';
import { TimeRecord } from '../data-classes/time-record';
import { Order } from '../data-classes/order';

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
  private order: Order;
  public records: TimeRecord[];
  public hans = [];

  public form_validation_messages = {
    description: [{ type: 'required', message: 'Bitte Art der Arbeit eintragen' }],
    workingHours: [{ type: 'required', message: 'Bitte Stunden eintragen' }]
  };

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    private indexDbService: IndexDBService
  ) {
    this.dateAdapter.setLocale('de');
    this.columns = ['Date', 'Description', 'Time', 'Delete'];

    this.timeRecordForm = this.formBuilder.group({
      time_records: this.formBuilder.array([
        this.formBuilder.group({
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

    this.createRecordForm = this.formBuilder.group({
      customer: []
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

  public addEmptyControl() {
    const control = <FormArray>this.timeRecordForm.controls.time_records;
    control.push(
      this.formBuilder.group({
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
        date: [record.date, Validators.required],
        description: [record.description, Validators.required],
        workingHours: [record.workingHours, Validators.required]
      })
    );
    console.log('Control', control);
  }

  public onSubmit() {
    const recordsFromFormInput = this.timeRecordForm.controls.time_records.value;
    recordsFromFormInput.forEach(record => {
      this.indexDbService.addRecordToOrder(record, this.paramId);
    });
  }

  // Database Operations

  public insertRecord() {
    console.log('Record', this.indexDbService.insertOneRecord());
  }

  get timeRecords() {
    return this.timeRecordForm.get('time_records') as FormArray;
  }

  public getOrders() {
    this.indexDbService.getAllOrders().then(data => {
      console.log('Orders', data);
    });
  }

  public getOrderById(orderId) {
    this.indexDbService.getOrderById(orderId)
      .then(order => {
        console.log('Order', order[0]);
        this.records = order[0].records;
        this.records.forEach(record => {
          console.log('Record', record);
          this.addControl(record);
        });
    });
  }
}
