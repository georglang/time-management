import { Component, OnInit, Input } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";

// import { IndexedDBService } from '../service/indexedDb-service/indexedDb.service';
import { DateAdapter } from "@angular/material/core";
import { TimeRecord, ITimeRecord } from "../data-classes/TimeRecords";
import { ConfirmDeleteDialogComponent } from "./../confirm-delete-dialog/confirm-delete-dialog.component";
import { ToastrService } from "ngx-toastr";
import { FirestoreOrderService } from "../service/firestore-order-service/firestore-order.service";
import { FirestoreRecordService } from "../service/firestore-record-service/firestore-record.service";
// import { SynchronizeIdxDBWithFirebaseService } from "../service/synchronize-idxDb-with-firebase-service/synchronize-idxDb-with-firebase.service";
import { MessageService } from "../service/message-service/message.service";

import * as moment from "moment";
import { ConnectionService } from "ng-connection-service";
import { IOrder } from "../data-classes/Order";
moment.locale("de");

// import * as jsPDF from 'jspdf';
// import "jspdf-autotable";

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";

interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

@Component({
  selector: "app-order-detail",
  templateUrl: "./order-detail.component.html",
  styleUrls: ["./order-detail.component.sass"],
})
export class OrderDetailComponent implements OnInit {
  @Input() customer;
  private paramOrderId;
  public _isOnline;
  public sumOfWorkingHours;
  public order: IOrder;
  public columns: string[];
  public totalTime = 0.0;
  public records: ITimeRecord[] = [];
  public displayedColumns = [
    "select",
    "date",
    "description",
    "workingHours",
    "employee",
    "excluded",
  ];
  public dataSource: MatTableDataSource<ITimeRecord>;
  public hasRecordsFound: boolean = false;
  public dateFormated;
  public selection = new SelectionModel<ITimeRecord>(true, []);

  highlighted = new SelectionModel<ITimeRecord>(false, []);


  private orderIds: number[] = [];
  public pdf = new jsPDF() as jsPDFWithPlugin;

  public selected = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateAdapter: DateAdapter<Date>,
    // private indexedDbService: IndexedDBService,
    private toastrService: ToastrService,
    public dialog: MatDialog,
    private readonly connectionService: ConnectionService,
    private firestoreOrderService: FirestoreOrderService,
    private firestoreRecordService: FirestoreRecordService,
    // private synchronizeIdxDBWithFirebase: SynchronizeIdxDBWithFirebaseService,
    private messageService: MessageService
  ) {
    this.dateAdapter.setLocale("de");
    this.columns = ["Date", "Description", "Time", "Delete"];
    this.sumOfWorkingHours = 0;

    if (window.indexedDB) {
      console.log("IndexedDB is supported");
    }
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.paramOrderId = params["id"];
      const order = this.getOrderByIdFromCloudDatabase(this.paramOrderId);

      // if (this.isOnline()) {
      //   this.getOrderByIdFromCloudDatabase(this.paramOrderId);
      // }

      // if (this.isOnline()) {
      //   this.getRecords(this.paramId);
      // } else {
      //   console.log('Get records from indexedDB');
      // }

      // this.getOrderById(this.paramId);
      // this.getOrderByIdFromIndexedDbOrders(this.paramOrderId);

      // this.getRecordsFromRecordsOutbox(this.paramId).then(records => {
      //   if (records !== undefined) {
      //     this.records = records;
      //     this.dataSource = new MatTableDataSource<ITimeRecord>(this.records);
      //   }
      // });

      // this.records = this.getRecordsFromRecordsOutbox(this.paramId);
    });

    this.connectionService.monitor().subscribe((isOnline) => {
      if (this._isOnline) {
        // this.indexedDbService.getOrdersFromOrdersOutbox().then(orders => {
        //   if (orders.length !== 0) {
        //     orders.forEach(order => {
        //       const id = order.id;
        //       delete order.id;
        //       this.firestoreOrderService.addOrder(order).then(() => {
        //         this.indexedDbService.getOrdersFromOrdersTable().then(ordersInIndexedDB => {
        //           ordersInIndexedDB.forEach(cachedOrder => {
        //             this.orderIds.push(cachedOrder.id);
        //           });
        //           orders.forEach(_order => {
        //             if (!this.orderIds.includes(_order.id)) {
        //               this.indexedDbService.addToOrdersTable(order).then(() => {
        //                 this.indexedDbService.deleteOrderInOrdersOutbox(id);
        //               });
        //             }
        //           });
        //         });
        //       });
        //     });
        //   }
        // });
      }
    });

    debugger;
    console.log('Is Selected: ', this.highlighted.isSelected)
  }

  public isOnline() {
    return navigator.onLine;
  }

  public navigateToOrderList(): void {
    this.router.navigate(["/"]);
  }

  //
  // Online Handling
  //

  public getOrderByIdFromCloudDatabase(orderId: string) {
    this.firestoreOrderService
      .getOrderById(orderId)
      .subscribe((order: IOrder) => {
        if (order !== undefined) {
          this.order = order;
          this.getRecordsFromCloudDatabase(orderId);
        }
      });
  }

  public getRecordsFromCloudDatabase(orderId: string): any {
    if (this.firestoreOrderService !== undefined) {
      this.firestoreRecordService
        .getRecordsByOrderId(orderId)
        .subscribe((records: ITimeRecord[]) => {
          this.order.records = records;
          this.setRecordDataSource(records);
        });
    }
  }

  public setRecordDataSource(records: ITimeRecord[]) {
    if (records.length > 0) {
      this.dataSource = new MatTableDataSource<ITimeRecord>(records);
      this.getSumOfWorkingHours(records);
      this.hasRecordsFound = true;
    } else {
      this.dataSource = new MatTableDataSource<ITimeRecord>();
      this.sumOfWorkingHours = 0;
      this.hasRecordsFound = false;
    }
  }

  public getSumOfWorkingHours(records: ITimeRecord[]) {
    this.sumOfWorkingHours = 0;
    if (records !== undefined) {
      records.forEach((record) => {
        this.sumOfWorkingHours += record.workingHours;
      });
    }
  }

  //
  // Offline
  //

  // public getOrderByIdFromIndexedDbOrders(orderId: any) {
  //   if (typeof orderId !== 'string') {
  //     this.indexedDbService.getOrderById(orderId).then((order: IOrder[]) => {
  //       if (order.length > 0) {
  //         this.order = order[0];
  //         this.setRecordDataSource(this.order.records);
  //       }
  //     });
  //   } else {
  //     this.indexedDbService.getOrderByFirebaseId(orderId).then((order: IOrder[]) => {
  //       if (order.length > 0) {
  //         this.order = order[0];
  //         this.setRecordDataSource(this.order.records);
  //       }
  //     });
  //   }
  // }

  // records from firebase and indexedDB
  public getRecords(orderId: string) {
    const records: TimeRecord[] = [];

    if (this.isOnline()) {
      // this.firestoreRecordService.getRecords();

      // this.firestoreRecordService.x(orderId).subscribe(recordsInFirebase => {
      //   if (recordsInFirebase !== undefined) {
      //     if (recordsInFirebase.length > 0) {
      //       recordsInFirebase.forEach(record => {
      //         record.date = moment.unix(record.date.seconds).format('MM.DD.YYYY');
      //         records.push(record);
      //         this.getSumOfWorkingHours(records);
      //       });
      //     } else {
      //       this.sumOfWorkingHours = 0;
      //     }
      //   }
      // });
      this.dataSource.data = records;
    } else {
      console.log("Get Data from Indexed DB");
    }
  }

  public getRecordsFromOrdersOutbox(orderId: string) {
    // this.indexedDbService.getOrdersFromOrdersOutbox().then(records => {
    // records.forEach(record => {
    //   record.date = new Date(record.date);
    // });
    // console.log('Records from Outbox', records);
    // this.dataSource = new MatTableDataSource<ITimeRecord>(records);
    // });
  }

  // public getRecordsFromRecordsOutbox(orderId: string): Promise<any> {
  // return this.indexedDbService.getRecordsFromRecordsOutboxTable().then(records => {
  //   return records;
  // });
  // }

  // public getOrderById(orderId: string) {
  //   if (this.isOnline()) {
  //     this.firestoreOrderService.getOrderById(orderId).then(order => {
  //       this.order = order;
  //     });
  //   } else {
  //     this.indexDbService.getOrderById(orderId).then(order => {
  //       if (order.length !== 0) {
  //         if (order[0].hasOwnProperty('records')) {
  //           this.order = order[0];
  //           this.records = order[0].records;
  //           this.dataSource = new MatTableDataSource<ITimeRecord>(this.records);
  //         }
  //       }
  //     });
  //   }
  // }

  public createNewRecord() {
    this.router.navigate([
      "/order-details/" + this.paramOrderId + /create-record/,
    ]);
  }

  public editRecord(id: any) {
    this.router.navigate([
      "/order-details/" + this.paramOrderId + /edit-record/ + id,
    ]);
  }

  public deleteRecord(recordId) {
    this.openDeleteRecordDialog(recordId);
  }

  public archiveRecord(record: ITimeRecord) {
    record.excluded = true;
  }

  public showDeleteMessage() {
    const successConfig = {
      positionClass: "toast-bottom-center",
      timeout: 500,
    };
    this.toastrService.error("Erfolgreich gelöscht", "Eintrag", successConfig);
  }

  public showSuccessMessage() {
    const successConfig = {
      positionClass: "toast-bottom-center",
      timeout: 500,
    };
    this.toastrService.success(
      "Erfolgreich erstellt",
      "Eintrag",
      successConfig
    );
  }

  public openDeleteRecordDialog(recordId: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(
      ConfirmDeleteDialogComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe((shouldDelete) => {
      if (shouldDelete) {
        this.deleteRecordInFirebase(recordId);
      }
    });
  }

  public deleteRecordInFirebase(recordId: string): void {
    this.firestoreRecordService
      .deleteRecord(this.paramOrderId, recordId)
      .then((data) => {
        this.showDeleteMessage();
        // load records after deletion
        this.getRecordsFromCloudDatabase(this.paramOrderId);

        // ToDo Offline Handling
        // delete record in indexedDB orders table
        // this.indexDbService.deleteRecordInOrdersTable(this.paramId, _recordId).then(() => {
        //   this.messageService.recordDeletedSuccessful();
        // });
      });

    // this.indexedDbService.deleteRecordInOrdersTable(this.paramOrderId, recordId).then(data => {});
  }

  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */ masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : // this.dataSource.data.forEach(row => this.selection.select(row));

        this.dataSource.data.forEach((row) => {
          if (!row.excluded) {
            this.selection.select(row);
          }
        });
  }

  public print() {
    this.pdf.setFont("Helvetica");
    this.pdf.setFontSize(12);

    const columns = [
      { title: "Datum", dataKey: "date" },
      { title: "Beschreibung", dataKey: "description" },
      { title: "Arbeitsstunden", dataKey: "workingHours" },
      { title: "Arbeiter", dataKey: "employee" },
    ];

    const recordsToPrint = [];

    this.selection.selected.forEach((selectedRecord) => {
      this.dateFormated = moment(selectedRecord["date"]).format("DD.MM.YYYY");

      // recordsToPrint.push(
      //   new TimeRecord(
      //     this.dateFormated,
      //     selectedRecord["description"],
      //     selectedRecord["workingHours"],
      //     selectedRecord["employee"],
      //     "",
      //     ""
      //   )
      // );

      recordsToPrint.push([
        this.dateFormated,
        selectedRecord["description"],
        selectedRecord["workingHours"],
        selectedRecord["employee"],
      ]);
    });

    console.log("Time Record", recordsToPrint);

    const customerInfo = document.getElementById("customer-info");

    const date = customerInfo.children[0].children[1].childNodes[0].textContent.trim();
    const customerName = customerInfo.children[0].children[1].childNodes[1].textContent.trim();
    const location = customerInfo.children[0].children[1].childNodes[2].textContent.trim();
    const contactPerson = customerInfo.children[0].children[1].childNodes[3].textContent.trim();

    this.pdf.text(
      "Forstbetrieb Tschabi | Hochkreuthweg 3 | 87642 Trauchgau",
      12,
      20
    );

    this.pdf.text("Datum: ", 12, 39);
    this.pdf.text(date, 42, 359);

    this.pdf.text("Kunde: ", 12, 46);
    this.pdf.text(customerName, 42, 46);

    this.pdf.text("Ort: ", 12, 53);
    this.pdf.text(location, 42, 53);

    this.pdf.text("Einsatzleiter: ", 12, 60);
    this.pdf.text(contactPerson, 42, 60);

    this.pdf.autoTable({
      head: [["Datum", "Beschreibung", "Arbeitsstunden", "Arbeiter"]],
      body: recordsToPrint,
      margin: { top: 78 },
      pageBreak: "auto",
      showHead: "everyPage",
      showFoot: "everyPage",
    });

    this.loadLogo();
  }

  private loadLogo() {
    this.loadImage("assets/img/logo100px.png").then(
      (logo: HTMLImageElement) => {
        this.pdf.addImage(logo, "PNG", 170, 17, 24, 24);
        this.loadFooterImage();
      }
    );
  }

  private loadFooterImage() {
    this.loadImage("assets/img/letter_footer.png").then((logo) => {
      this.pdf.addSvgAsImage("assets/letter_footer.svg", 200, 12, 200, 100);
      this.saveAsPdf();
    });
  }

  private saveAsPdf() {
    const dateNow = moment().format("DD.MM.YYYY HH.MM");
    const filename = "Regienstunden " + dateNow + ".pdf";
    this.pdf.save(filename);
  }

  private loadImage(url) {
    return new Promise((resolve) => {
      let img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  }

  // Beim allgemeinen synchronisieren muss zuerst herausgefunden werden, was ueberhaut sychronisiert werden muss
  // Erstellen Order und Record Offline: schauen in ordersOutbox
  public synchronizeOrdersAndRecords() {
    // this.synchronizeIdxDBWithFirebase.synchronizeWithFirebase();
  }

  buttonsFor(row) {
    debugger;
    console.log('Row: ', row);

  }
}
