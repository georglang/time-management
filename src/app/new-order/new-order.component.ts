import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { Order } from './../data-classes/order';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.sass']
})
export class NewOrderComponent implements OnInit {
  public customerForm: FormGroup;
  public columns: string[];

  constructor(
    private formBuilder: FormBuilder,
    private indexDbService: IndexDBService
  ) {
    this.columns = ['Firma', 'Ansprechpartner', 'Ort'];

    this.customerForm = this.formBuilder.group({
      companyName: ['', Validators.required],
      place: ['', Validators.required],
      contactPerson: ['']
    });
  }

  ngOnInit() { }

  public addRecord(order: Order) {
    this.indexDbService.addOrder(order);
    // this.addRecord.emit(this.title);
    // this.indexDbService.addOrder(new Order(
    //   'Forstbetrieb Tschabi',
    //   'Trauchgau',
    //   'Georg Lang'
    // ));
  }

  public onSubmit() {
    this.indexDbService.addOrder(this.customerForm.value);
  }
}
