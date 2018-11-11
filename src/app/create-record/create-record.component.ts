import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { TimeRecord } from '../data-classes/time-record';
import { ToastrService, Toast } from 'ngx-toastr';

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
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.createRecordForm = this.formBuilder.group({
      id: [''],
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: [0, Validators.required]
    });

    this.route.params.subscribe(params => {
      this.paramId = +params['id'];
    });
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

  public addRecord(record: TimeRecord, orderId: number) {
    console.log('Record', record);
    if (!record.hasOwnProperty('id') || record.id === '') {
      this.indexDbService.getAllRecords(orderId).then(records => {
        console.log('Records', records);

        if (records.length !== 0) {
          const lastId = records[records.length - 1].id;
          const idAsNumber = Number(lastId);
          record.id = String(idAsNumber + 1);
        } else {
          record.id = '1';
        }
        this.indexDbService.addRecordToOrder(record, this.paramId);
      });
    } else {
      this.indexDbService.modifyOrder(record, this.paramId);
    }
  }

  public onSubmit() {
    this.addRecord(this.createRecordForm.value, this.paramId);
  }
}
