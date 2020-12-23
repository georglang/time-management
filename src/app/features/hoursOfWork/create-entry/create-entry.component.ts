import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { MessageService } from '../services/message-service/message.service';
import { FirestoreRecordService } from '../services/firestore-record-service/firestore-record.service';
import { TimeRecord, ITimeRecord } from '../data-classes/TimeRecords';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { eCategory } from './../data-classes/eCategory';
import { INote, Note } from '../data-classes/Note';
import { IMaterial, Material } from '../data-classes/Material';
import { FirestoreMaterialService } from '../services/firestore-material-service/firestore-material.service';
import { FirestoreNoteService } from '../services/firestore-note-service/firestore-note.service';
import { materials } from '../material-list/materials';

@Component({
  selector: 'app-create-entry',
  templateUrl: './create-entry.component.html',
  styleUrls: ['./create-entry.component.sass'],
})
export class CreateEntryComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  public createEntryForm: FormGroup;
  public workingHoursForm: FormGroup;
  public materialForm: FormGroup;
  public noteForm: FormGroup;

  private routeParamOrderId;
  public submitted = false;
  public selectedCategory: eCategory;
  public eCategory = eCategory;

  public categories = [
    {
      value: eCategory.workingHours,
      viewValue: 'Stunden',
    },
    {
      value: eCategory.material,
      viewValue: 'Material',
    },
    {
      value: eCategory.note,
      viewValue: 'Notizen',
    },
  ];

  // ToDo consume employees from backend service
  public employees = [
    {
      value: 'Erle Wastl',
      viewValue: 'Erle Wastl',
    },
    {
      value: 'Greisl Martin',
      viewValue: 'Greisl Martin',
    },
    {
      value: 'Martin Johann',
      viewValue: 'Martin Johann',
    },
    {
      value: 'Speer Leonhard',
      viewValue: 'Speer Leonhard',
    },
    {
      value: 'Strobel Michael',
      viewValue: 'Strobel Michael',
    },
    {
      value: 'Tschabi Matthias',
      viewValue: 'Tschabi Matthias',
    },
  ];

  public units = [
    {
      value: 'Stück',
      viewValue: 'Stück',
    },
    {
      value: 'kg',
      viewValue: 'kg',
    },
    {
      value: 'Paar',
      viewValue: 'Paar',
    },
  ];

  filteredOptions: Observable<string[]>;
  options: string[] = materials;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private firestoreRecordService: FirestoreRecordService,
    private firestoreMaterialService: FirestoreMaterialService,
    private firestoreNoteService: FirestoreNoteService,
    private messageService: MessageService,
    private location: Location
  ) {
    this.createEntryForm = this.formBuilder.group({
      category: ['', Validators.required],
    });

    this.workingHoursForm = this.formBuilder.group({
      date: ['', Validators.required],
      description: ['', Validators.required],
      workingHours: ['', Validators.required],
      employee: ['', Validators.required],
    });

    this.materialForm = this.formBuilder.group({
      date: ['', Validators.required],
      material: ['', Validators.required],
      amount: ['', Validators.required],
      unit: ['', Validators.required],
    });

    this.noteForm = this.formBuilder.group({
      date: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.routeParamOrderId = params.id;
    });

    this.createEntryForm
      .get('category')
      .valueChanges.subscribe((category: eCategory) => {
        this.selectedCategory = category;
      });

    this.filteredOptions = this.materialForm.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value))
    );
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(
      (option) => option.toLowerCase().indexOf(filterValue) === 0
    );
  }

  public navigateToOrderList() {
    this.location.back();
  }

  public addRecordToFirebaseRecordsTable(record: ITimeRecord): void {
    if (this.firestoreRecordService !== undefined) {
      // check if record is already in firestore
      this.firestoreRecordService
        .checkIfRecordExistsInOrderInFirestore(record)
        .then((isAlreadyInFirestore: boolean) => {
          if (!isAlreadyInFirestore) {
            this.firestoreRecordService
              .addTimeRecord(record)
              .then((id: string) => {
                this.messageService.recordCreatedSuccessfully();
                this.router.navigate(['order-details', record.orderId]);
                record.id = id;
              })
              .catch((e) => {
                console.error('can´t create record to firebase', e);
              });
          } else {
            this.messageService.recordAlreadyExists();
          }
        });
    }
  }

  public addMaterialToFirebaseMaterialTable(material: IMaterial): void {
    if (this.firestoreMaterialService !== undefined) {
      this.firestoreMaterialService.addMaterial(material).then((id: string) => {
        this.messageService.materialCreatedSuccessfully();
        this.router.navigate(['order-details', material.orderId]);
      });
    }
  }

  public addNoteToFirebaseNoteTable(note: INote): void {
    if (this.firestoreNoteService !== undefined) {
      this.firestoreNoteService.addNote(note).then((id: string) => {
        this.messageService.materialCreatedSuccessfully();
        this.router.navigate(['order-details', note.orderId]);
      });
    }
  }

  get getEntryFormControls() {
    return this.createEntryForm.controls;
  }

  get getWorkingHoursFormControls() {
    return this.workingHoursForm.controls;
  }

  get getMaterialFormControls() {
    return this.materialForm.controls;
  }

  get getNoteFormControls() {
    return this.noteForm.controls;
  }

  public onSubmit() {
    this.submitted = true;
    if (this.createEntryForm.invalid) {
      return;
    } else {
      if (this.selectedCategory === eCategory.workingHours) {
        this.createWorkingHours(
          this.createEntryForm.value,
          this.routeParamOrderId
        );
      } else if (this.selectedCategory == eCategory.material) {
        this.createMaterial(this.materialForm.value, this.routeParamOrderId);
      } else if (this.selectedCategory === eCategory.note) {
        this.createNote(this.noteForm.value, this.routeParamOrderId);
      }
    }
  }

  public createWorkingHours(workingHoursFormInput: any, orderId: string): void {
    const record = new TimeRecord(
      workingHoursFormInput.date,
      workingHoursFormInput.description,
      workingHoursFormInput.workingHours,
      workingHoursFormInput.employee
    );
    record.orderId = orderId;
    this.addRecordToFirebaseRecordsTable(record);
  }

  createNote(noteFormInput: any, orderId: string): void {
    const note = new Note(
      noteFormInput.date,
      noteFormInput.description,
      noteFormInput.uploadUrl,
      orderId
    );

    this.addNoteToFirebaseNoteTable(note);
  }

  createMaterial(materialFormInput: any, orderId) {
    const material = new Material(
      materialFormInput.date,
      materialFormInput.material,
      materialFormInput.amount,
      materialFormInput.unit,
      orderId
    );

    this.addMaterialToFirebaseMaterialTable(material);
  }
}
