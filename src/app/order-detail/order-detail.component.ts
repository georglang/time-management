import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatTableDataSource, MatDialog, MatDialogConfig } from '@angular/material';

import { IndexDBService } from '../service/index-db.service';
import { DateAdapter } from '@angular/material';
import { TimeRecord, ITimeRecord } from '../data-classes/time-record';
import { IOrder } from '../data-classes/order';
import { ConfirmDeleteDialogComponent } from './../confirm-delete-dialog/confirm-delete-dialog.component';
import { ToastrService, Toast } from 'ngx-toastr';

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
  public displayedColumns = ['id', 'date', 'description', 'workingHours', 'action'];
  public dataSource: MatTableDataSource<ITimeRecord>;

  public form_validation_messages = {
    description: [{ type: 'required', message: 'Bitte Art der Arbeit eintragen' }],
    workingHours: [{ type: 'required', message: 'Bitte Stunden eintragen' }]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    private indexDbService: IndexDBService,
    private toastrService: ToastrService,
    public dialog: MatDialog
  ) {
    this.dateAdapter.setLocale('de');
    this.columns = ['Date', 'Description', 'Time', 'Delete'];
    this.dataSource = new MatTableDataSource<ITimeRecord>();

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
    this.indexDbService.deleteRecord(recordId, this.paramId).then(data => {
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

          if (this.records.length !== 0) {
            this.dataSource = new MatTableDataSource<ITimeRecord>(this.records);
          } else {
            this.records.forEach(record => {
              this.addControl(record);
            });
          }
        }
      }
    });
  }

  public createNewRecord() {
    console.log('Create Record ParamId', this.paramId);
    // this.router.navigate(['create-record'], this.paramId);
    this.router.navigate(['/order-details/' + this.paramId + /create-record/]);

    //this.router.navigate(['/order-details/' + this.paramId + '/create-record']);
  }

  public editRecord(id: any) {
    console.log('Row', id);
    // this.router.navigate(['edit-record', id]);
    this.router.navigate(['/order-details/' + this.paramId + /edit-record/ + id]);
  }

  public deleteRecord(recordId) {
    this.openConfirmDialog(recordId);
  }

  public showDeleteMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastrService.error('Erfolgreich gelöscht', 'Eintrag', successConfig);
  }

  public showSuccessMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastrService.success('Erfolgreich erstellt', 'Eintrag', successConfig);
  }

  openConfirmDialog(recordId) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      title: 'Eintrag Löschen'
    };
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.indexDbService.deleteRecord(this.paramId, recordId).then(data => {

          console.log('Data', data);
          this.getOrderById(this.paramId);
          this.showDeleteMessage();
        });

      }

      console.log('Dialog geschlossen');
      console.log('RESULT: ', result);
    });
  }
}
