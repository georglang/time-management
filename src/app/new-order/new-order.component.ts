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
      location: ['', Validators.required],
      contactPerson: ['']
    });
  }

  ngOnInit() { }

  public addOrder(order: Order) {
    this.indexDbService.addOrder(order)
      .then((data) => {
        console.log('Added Order', data);

      })
      .catch(e => {
        console.error('IndexDB add Order: ', e);
      });
    // this.addRecord.emit(this.title);
    // this.indexDbService.addOrder(new Order(
    //   'Forstbetrieb Tschabi',
    //   'Trauchgau',
    //   'Georg Lang'
    // ));
  }

  public onSubmit() {
    console.log('Submit');


    // this.addOrder(this.customerForm.value)
    this.indexDbService.addOrder(this.customerForm.value)
      .then((data) => {
        console.log('ADDED ORDER', data);

      });
  }
}
