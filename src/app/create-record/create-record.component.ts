import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexedDBService } from '../service/indexedDb.service';
import { ITimeRecord } from '../data-classes/time-record';
import { ToastrService, Toast } from 'ngx-toastr';
import { CloudFirestoreService } from '../service/cloudFirestore.service';

@Component({
  selector: 'app-create-record',
  templateUrl: './create-record.component.html',
  styleUrls: ['./create-record.component.sass']
})
export class CreateRecordComponent implements OnInit {
  public createRecordForm: FormGroup;
  private paramId;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private indexDbService: IndexedDBService,
    private toastr: ToastrService,
    private cloudFirestoreService: CloudFirestoreService
  ) {}

  ngOnInit() {
    this.createRecordForm = this.formBuilder.group({
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: ['', Validators.required]
    });

    this.route.params.subscribe(params => {
      this.paramId = params.id;
    });
  }

  public isConnected() {
    return navigator.onLine;
  }

  public navigateToOrderList() {
    this.router.navigate(['/order-details', this.paramId]);
  }

  public showSuccess() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.success('Erfolgreich erstellt', 'Eintrag', successConfig);
  }

  public createRecordIfOnline(newRecord: ITimeRecord, orderId: string) {
    newRecord.createdAt = new Date();
    this.cloudFirestoreService
      .checkIfRecordExistsInOrderInFirestore(orderId, newRecord)
      .then(doesRecordExist => {
        if (!doesRecordExist) {
          this.cloudFirestoreService.addTimeRecord(orderId, newRecord).then(timeRecordResponse => {
            console.log('Time Record Response', timeRecordResponse);
            this.toastMessageRecordSuccessfulCreated();
            this.router.navigate(['order-details', orderId]);
          });
        } else {
          this.toastMessageRecordAlreadyExists();
        }
      });
  }

  public createRecordIfOffline(newRecord: ITimeRecord, orderId: string) {
    this.indexDbService
      .checkIfRecordIsInOrdersTable(newRecord, orderId)
      .then(isAlreadyInOrdersTable => {
        if (!isAlreadyInOrdersTable) {
          this.indexDbService.addRecordToOrder(newRecord, orderId).then(data => {
            console.log('Created in indexedDB', data);
          });
        } else {
          this.toastMessageRecordAlreadyExists();
        }
      });
  }

  public toastMessageRecordAlreadyExists() {
    const errorConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.error('Existiert bereits', 'Eintrag', errorConfig);
  }

  public toastMessageRecordSuccessfulCreated() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastr.success('Erfolgreich erstellt', 'Eintrag', successConfig);
  }

  // if (this.isConnected()) {
  //   record.createdAt = new Date();
  //   this.indexDbService.addRecordToOrder(record, this.paramId);
  //   this.cloudFirestoreService.addTimeRecord(orderId, record).then(timeRecordResponse => {
  //     console.log('Time Record Response', timeRecordResponse);
  //     this.router.navigate(['order-details', orderId]);
  //   });
  // } else {
  //   console.log('No connection store in outbox');

  //   this.indexDbService.addRecordToOrderOutbox(record, this.paramId).then(data => {
  //     console.log('DATA', data);
  //   });
  //   this.indexDbService.addRecordToOrder(record, this.paramId).then(data => {});
  //   this.showSuccess();
  //   this.navigateToOrderList();

  //   if (!record.hasOwnProperty('id') || record.id === '') {
  //     this.indexDbService.getRecordsOfOrder(orderId).then(records => {
  //       console.log('Records', records);

  //       if (records.length !== 0) {
  //         const lastId = records[records.length - 1].id;
  //         const idAsNumber = Number(lastId);
  //         record.id = String(idAsNumber + 1);

  //         console.log('Record Id: ', record.id);
  //       } else {
  //         record.id = '1';
  //       }

  //       this.indexDbService.addRecordToOrder(record, this.paramId).then(data => {
  //         console.log('DATA', data);

  //         this.showSuccess();
  //         this.navigateToOrderList();
  //       });
  //     });
  //   } else {
  //     // this.indexDbService.modifyOrder(this.paramId, record);
  //   }
  // }

  public onSubmit() {
    // if (this.isConnected()) {
    //   this.createRecordIfOnline(this.createRecordForm.value, this.paramId);
    // } else {
    //   this.createRecordIfOffline(this.createRecordForm.value, this.paramId);
    // }
    this.createRecordIfOffline(this.createRecordForm.value, this.paramId);
  }
}
