// import { Component, OnInit } from '@angular/core';
// import { FirestoreMaterialService } from '../services/firestore-material-service/firestore-material.service';
// import { IMaterial } from '../data-classes/Material';
// import { MatTableDataSource } from '@angular/material/table';

// @Component({
//   selector: 'app-material-list',
//   templateUrl: './material-list.component.html',
//   styleUrls: ['./material-list.component.sass'],
// })
// export class MaterialListComponent implements OnInit {
//   public displayedColumns = ['material', 'numberOfPieces'];
//   public dataSource = new MatTableDataSource();

//   constructor(private firestoreMaterialService: FirestoreMaterialService) {}

//   ngOnInit() {
//     this.getMaterialsFromCloudDatabase();
//   }

//   public getMaterialsFromCloudDatabase(): void {
//     if (this.firestoreMaterialService !== undefined) {
//       this.firestoreMaterialService
//         .getMaterialsFromMaterialsCollection()
//         .then((materials: IMaterial[]) => {
//           if (materials !== undefined) {
//             this.dataSource = new MatTableDataSource();
//           }
//         });
//     }
//   }
// }
