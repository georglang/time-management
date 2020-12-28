import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { FirestoreMaterialService } from '../../hoursOfWork/services/firestore-material-service/firestore-material.service';
import { IMaterial } from '../../hoursOfWork/data-classes/Material';

import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { ConfirmDeleteDialogComponent } from '../../hoursOfWork/confirm-delete-dialog/confirm-delete-dialog.component';

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

  public showEditAndDeleteButton(selectedRecord: IMaterial) {
    this.selectedMaterial = selectedRecord;
    if (this.highlighted.selected.length == 0) {
      this.showButtonsIfMaterialIsSelected = false;
    } else {
      this.showButtonsIfMaterialIsSelected = true;
    }
  }

  public editMaterial(material: IMaterial) {
    debugger;
    this.router.navigate([
      'hours-of-work/order-details/' +
        material.orderId +
        '/edit-material/' +
        material.id,
    ]);
  }

  public deleteMaterial(material: IMaterial) {
    this.openDeleteRecordDialog(material.id);
  }

  public createEntry() {
    this.router.navigate([
      'hours-of-work/order-details/' + this.paramOrderId + /create-entry/,
    ]);
  }

  public openDeleteRecordDialog(materialId: string): void {
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
