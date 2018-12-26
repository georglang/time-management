import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { TimeRecord } from '../data-classes/time-record';
import { ToastrService, Toast } from 'ngx-toastr';
import { CloudFirestoreService } from './../service/cloud-firestore.service';

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
    private indexDbService: IndexDBService,
    private toastr: ToastrService,
    private firebaseService: CloudFirestoreService
  ) {}

  ngOnInit() {
    this.createRecordForm = this.formBuilder.group({
      id: [''],
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: ['', Validators.required]
    });

    this.route.params.subscribe(params => {
      this.paramId = params.id;
      console.log('ParamId', this.paramId);

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

  public createRecord(record: TimeRecord, orderId: string) {
    record.createdAt = new Date();
    console.log('createRecord()', record, orderId);

    if (this.isConnected()) {
      this.firebaseService.addTimeRecord(orderId, record);
    }




    // if (!record.hasOwnProperty('id') || record.id === '') {

    //   this.indexDbService.getAllRecords(orderId).then(records => {
    //     console.log('Records', records);

    //     if (records.length !== 0) {
    //       const lastId = records[records.length - 1].id;
    //       const idAsNumber = Number(lastId);
    //       record.id = String(idAsNumber + 1);

    //       console.log('Record Id: ', record.id);
    //     } else {
    //       record.id = '1';
    //     }


    //     this.indexDbService.addRecordToOrder(record, this.paramId)
    //       .then((data) => {
    //         console.log('DATA', data);

    //         this.showSuccess();
    //         this.navigateToOrderList();
    //       });
    //   });
    // } else {
    //   this.indexDbService.modifyOrder(this.paramId, record);
    // }
  }

  public onSubmit() {
    this.createRecord(this.createRecordForm.value, this.paramId);
  }
}
