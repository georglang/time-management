import { Component, Input, OnInit } from '@angular/core';
import { FirestoreMaterialService } from '../services/firestore-material-service/firestore-material.service';
import { IMaterial } from '../data-classes/Material';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-material-list',
  templateUrl: './material-list.component.html',
  styleUrls: ['./material-list.component.sass'],
})
export class MaterialListComponent implements OnInit {
  @Input() orderId: string;
  public displayedColumns = ['date', 'material', 'amount', 'unit'];
  public dataSource = new MatTableDataSource();
  public hasMaterialsFound: boolean = false;
  public selection = new SelectionModel<IMaterial>(true, []);

  constructor(private firestoreMaterialService: FirestoreMaterialService) {}

  ngOnInit() {
    this.getMaterialsFromCloudDatabase();
  }

  public getMaterialsFromCloudDatabase(): void {
    if (this.firestoreMaterialService !== undefined) {
      this.firestoreMaterialService
        .getMaterialsByOrderId(this.orderId)
        .subscribe((materials: IMaterial[]) => {
          if (materials.length > 0) {
            this.setMaterialDataSource(materials);
          } else {
            this.hasMaterialsFound = false;
          }
        });
    }
  }

  private setMaterialDataSource(materials: IMaterial[]) {
    this.dataSource = new MatTableDataSource<IMaterial>(materials);
    this.hasMaterialsFound = true;
  }
}
