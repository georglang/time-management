import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { DateAdapter } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Material, IMaterial } from '../Material';
Material;
import { MessageService } from '../../working-hour/services/message-service/message.service';
import { FirestoreMaterialService } from '../services/firestore-material-service/firestore-material.service';

@Component({
  selector: 'app-edit-material',
  templateUrl: './edit-material.component.html',
  styleUrls: ['./edit-material.component.sass'],
})
export class EditMaterialComponent implements OnInit {
  public editMaterialForm: FormGroup;
  private materialId: string;
  private orderId: string;
  public material: IMaterial;
  public submitted = false;
  private subscription: Subscription = new Subscription();

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

  public tools = [
    {
      value: 'Mann',
      viewValue: 'Mann',
    },
    {
      value: 'Mann mit Motorsäge',
      viewValue: 'Mann mit Motorsäge',
    },
    {
      value: 'Seilschlepper',
      viewValue: 'Seilschlepper',
    },
    {
      value: 'Schlepper + Rückewagen',
      viewValue: 'Schlepper + Rückewagen',
    },
    {
      value: 'HSM',
      viewValue: 'HSM',
    },
    {
      value: 'HSM + Woody',
      viewValue: 'HSM + Woody',
    },
    {
      value: 'Rückezug',
      viewValue: 'Rückezug',
    },
    {
      value: 'Rückezug + Winde + Bänder',
      viewValue: 'Rückezug + Winde + Bänder',
    },
    {
      value: 'Harvester',
      viewValue: 'Harvester',
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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    private firestoreMaterialService: FirestoreMaterialService,
    private messageService: MessageService,
    private toastrService: ToastrService,
    private location: Location
  ) {
    this.dateAdapter.setLocale('de');
  }

  ngOnInit() {
    this.editMaterialForm = this.formBuilder.group({
      date: ['', Validators.required],
      material: ['', Validators.required],
      amount: [0, Validators.required],
      unit: ['', Validators.required],
    });

    this.route.parent.url.subscribe((urlPath) => {
      this.orderId = urlPath[1].path;
    });

    this.route.params.subscribe((params) => {
      this.materialId = params['id'];
      this.getMaterialByIdFromFirebase(this.orderId, this.materialId);
    });
  }

  private getMaterialByIdFromFirebase(
    orderId: string,
    materialId: string
  ): void {
    const getMaterialById$ = this.firestoreMaterialService
      .getMaterialById(orderId)
      .subscribe(() => {});

    this.subscription.add(getMaterialById$);

    const getMaterialByOrderId = this.firestoreMaterialService
      .getMaterialsByOrderId(orderId)
      .subscribe((materials: any[]) => {
        if (materials !== undefined) {
          materials.forEach((material) => {
            if (material.id === materialId) {
              this.material = new Material(
                material.date,
                material.material,
                material.amount,
                material.unit,
                orderId
              );
              this.setControl(this.material);
            }
          });
        }
      });
    this.subscription.add(getMaterialByOrderId);
  }

  public navigateToMaterialList(): void {
    this.location.back();
  }

  public setControl(material: IMaterial): void {
    let date;

    if (material.date.seconds !== undefined) {
      date = material.date.toDate();
    } else {
      date = material.date;
    }

    this.editMaterialForm.setValue({
      date: date,
      material: material.material,
      amount: material.amount,
      unit: material.unit,
    });
  }

  get getEditMaterialFormControls() {
    return this.editMaterialForm.controls;
  }

  public onSubmit() {
    const material = new Material(
      this.editMaterialForm.controls.date.value,
      this.editMaterialForm.controls.material.value,
      this.editMaterialForm.controls.amount.value,
      this.editMaterialForm.controls.unit.value,
      this.orderId
    );

    this.submitted = true;
    if (this.editMaterialForm.invalid) {
      return;
    } else {
      this.checkIfMaterialExistsInOrderInFirestore(material);
    }
  }

  private checkIfMaterialExistsInOrderInFirestore(material: IMaterial) {
    this.firestoreMaterialService
      .checkIfMaterialExistsInOrderInFirestore(material)
      .then((doesMaterialExist) => {
        if (!doesMaterialExist) {
          this.updateMaterialInFirestore(this.orderId, material);
        } else {
          this.messageService.materialAlreadyExists();
        }
      });
  }

  private updateMaterialInFirestore(
    orderId: string,
    material: IMaterial
  ): void {
    if (this.firestoreMaterialService !== undefined) {
      this.setControl(material);
      this.firestoreMaterialService
        .updateMaterial(orderId, material)
        .then(() => {
          this.showUpdateMessage();
        });
    }
  }

  private showUpdateMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500,
    };
    this.toastrService.success(
      'Erfolgreich aktualisiert',
      'Eintrag',
      successConfig
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
