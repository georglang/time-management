import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
// import { materials } from '../material-list/materials';

import { Location } from '@angular/common';
import { MessageService } from '../../working-hour/services/message-service/message.service';

import { Material } from '../Material';
import { FirestoreMaterialService } from '../services/firestore-material-service/firestore-material.service';

@Component({
  selector: 'app-create-material',
  templateUrl: './create-material.component.html',
  styleUrls: ['./create-material.component.sass'],
})
export class CreateMaterialComponent implements OnInit {
  public createMaterialForm: FormGroup;
  private routeParamOrderId;
  public submitted = false;

  myControl = new FormControl();
  // options: string[] = materials;

  filteredOptions: Observable<string[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private firestoreMaterialService: FirestoreMaterialService,
    private messageService: MessageService,
    private location: Location
  ) {}

  ngOnInit() {
    this.createMaterialForm = this.formBuilder.group({
      date: ['', Validators.required],
      material: ['', Validators.required],
      numberOfPieces: ['', Validators.required],
      unit: ['', Validators.required],
    });

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );

    /// Weiter description wird nicht gesetzt

    this.route.params.subscribe((params) => {
      this.routeParamOrderId = params.id;
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    // return this.options.filter(
    //   (option) => option.toLowerCase().indexOf(filterValue) === 0
    // );
  }

  public navigateToOrderList() {
    this.location.back();
  }

  public createMaterial(formInput: any, orderId: string): void {
    const material = new Material(
      formInput.date,
      formInput.material,
      formInput.numberOfPieces,
      formInput.unit,
      orderId
    );
    this.addMaterialToFirebaseMaterialsTable(material);
  }

  public addMaterialToFirebaseMaterialsTable(material: any): void {
    if (this.firestoreMaterialService !== undefined) {
      // check if material is already in firestore

      this.firestoreMaterialService
        .addMaterial(material)
        .then((id: string) => {
          this.messageService.workingHourCreatedSuccessfully();
          this.router.navigate(['order-details', material.orderId]);
          material.id = id;
        })
        .catch((e) => {
          console.error('can´t create working hour in firebase', e);
        });
    }
  }

  get getFormControl() {
    return this.createMaterialForm.controls;
  }

  public onSubmit() {
    this.createMaterialForm.get('description').setValue(this.myControl.value);
    this.submitted = true;

    if (this.createMaterialForm.invalid) {
      return;
    } else {
      this.createMaterial(
        this.createMaterialForm.value,
        this.routeParamOrderId
      );
    }
  }
}
