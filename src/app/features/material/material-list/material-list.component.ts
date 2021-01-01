import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { FirestoreMaterialService } from '../services/firestore-material-service/firestore-material.service';
import { IMaterial } from '../Material';

import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { ConfirmDeleteDialogComponent } from '../../working-hour/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-material-list',
  templateUrl: './material-list.component.html',
  styleUrls: ['./material-list.component.sass'],
})
export class MaterialListComponent implements OnInit {
  public paramOrderId;
  public displayedColumns = ['date', 'material', 'amount', 'unit'];
  public dataSource = new MatTableDataSource();
  public hasMaterialsFound: boolean = false;
  public selection = new SelectionModel<IMaterial>(true, []);
  public highlighted = new SelectionModel<IMaterial>(false, []);
  public selectedMaterial: IMaterial;
  public showButtonsIfMaterialIsSelected: boolean = false;
  public showPrintButton: boolean = false;
  public showDeleteButton: boolean = false;

  constructor(
    private firestoreMaterialService: FirestoreMaterialService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.paramOrderId = params['id'];
      this.getMaterialsFromCloudDatabase(this.paramOrderId);
    });
  }

  private getMaterialsFromCloudDatabase(orderId: string): void {
    if (this.firestoreMaterialService !== undefined) {
      this.firestoreMaterialService
        .getMaterialsByOrderId(orderId)
        .subscribe((materials: IMaterial[]) => {
          if (materials.length > 0) {
            this.setMaterialDataSource(materials);
          } else {
            this.hasMaterialsFound = false;
          }
        });
    }
  }

  public showEditAndDeleteButton(selectedWorkingHour: IMaterial) {
    this.selectedMaterial = selectedWorkingHour;
    if (this.highlighted.selected.length == 0) {
      this.showButtonsIfMaterialIsSelected = false;
    } else {
      this.showButtonsIfMaterialIsSelected = true;
    }
  }

  public editMaterial(material: IMaterial) {
    this.router.navigate([
      'working-hours/order-details/' +
        material.orderId +
        '/edit-material/' +
        material.id,
    ]);
  }

  public deleteMaterial(material: IMaterial) {
    this.openDeleteWorkingHourDialog(material.id);
  }

  public createEntry() {
    this.router.navigate([
      'working-hours/order-details/' + this.paramOrderId + /create-entry/,
    ]);
  }

  public openDeleteWorkingHourDialog(materialId: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(
      ConfirmDeleteDialogComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe((shouldDelete) => {
      if (shouldDelete) {
        this.deleteMaterialInFirebase(materialId);
      }
    });
  }

  public deleteMaterialInFirebase(materialId: string): void {
    this.firestoreMaterialService
      .deleteMaterial(this.paramOrderId, materialId)
      .then((data) => {
        this.showDeleteMessage();
        this.getMaterialsFromCloudDatabase(this.paramOrderId);
      });
  }

  public showDeleteMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500,
    };
    this.toastrService.error('Erfolgreich gelöscht', 'Eintrag', successConfig);
  }

  private setMaterialDataSource(materials: IMaterial[]) {
    this.dataSource = new MatTableDataSource<IMaterial>(materials);
    this.hasMaterialsFound = true;
  }
}
