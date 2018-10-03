import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

export class Customer {
  constructor(public companyName, public place, public contactPerson?, public id?: number) {}
}

@Component({
  selector: 'app-new-customer',
  templateUrl: './new-customer.component.html',
  styleUrls: ['./new-customer.component.sass']
})
export class NewCustomerComponent implements OnInit {
  public customerForm: FormGroup;
  public columns: string[];

  constructor(private formBuilder: FormBuilder) {
    this.columns = ['Firma', 'Ansprechpartner', 'Ort'];

    this.customerForm = this.formBuilder.group({
      company: ['', Validators.required],
      place: ['', Validators.required],
      contactPerson: ['']
    });
  }

  ngOnInit() {}

  public onSubmit() {
    const customerFormInput = this.customerForm.controls.value;
    console.log('Form input', this.customerForm.value);

    // recordsFromFormInput.forEach(record => {
    //   this.indexDbService.addRecord(record);
    // });
  }
}
