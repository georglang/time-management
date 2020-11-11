import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { DateAdapter } from '@angular/material/core';
import { TimeRecord, ITimeRecord } from '../data-classes/TimeRecords';
import { ConfirmDeleteDialogComponent } from './../confirm-delete-dialog/confirm-delete-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { FirestoreOrderService } from '../service/firestore-order-service/firestore-order.service';
import { FirestoreRecordService } from '../service/firestore-record-service/firestore-record.service';

import * as moment from 'moment';
import { ConnectionService } from 'ng-connection-service';
import { IOrder } from '../data-classes/Order';
moment.locale('de');

// import * as jsPDF from 'jspdf';
// import "jspdf-autotable";

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import { ConfirmPrintDialogComponent } from '../confirm-print-dialog/confirm-print-dialog.component';

interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.sass']
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
    'select',
    'date',
    'description',
    'workingHours',
    'employee',
    'hasBeenPrinted',
  ];
  public dataSource: MatTableDataSource<ITimeRecord>;
  public hasRecordsFound: boolean = false;
  public dateFormated;
  public selection = new SelectionModel<ITimeRecord>(true, []);

  public highlighted = new SelectionModel<ITimeRecord>(false, []);
  public selectedRecord: ITimeRecord;
  public showButtonsIfRecordIsSelected: boolean = false;
  public showPrintButton: boolean = false;
  public showDeleteButton: boolean = false;

  public pdf = new jsPDF() as jsPDFWithPlugin;

  public selected = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateAdapter: DateAdapter<Date>,
    private toastrService: ToastrService,
    public dialog: MatDialog,
    private firestoreOrderService: FirestoreOrderService,
    private firestoreRecordService: FirestoreRecordService
  ) {
    this.dateAdapter.setLocale('de');
    this.columns = ['Date', 'Description', 'Time', 'Delete'];
    this.sumOfWorkingHours = 0;
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.paramOrderId = params['id'];
      this.getOrderByIdFromCloudDatabase(this.paramOrderId);
    });
  }

  public isOnline() {
    return navigator.onLine;
  }

  public navigateToOrderList(): void {
    this.router.navigate(['/']);
  }

  public getOrderByIdFromCloudDatabase(orderId: string) {
    this.firestoreOrderService.getOrderById(orderId).then((order: IOrder) => {
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
          const recordsSortedByDate = this.order.records.sort(
            (a, b) => b.date.toMillis() - a.date.toMillis()
          );
          this.setRecordDataSource(recordsSortedByDate);
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

  public getRecords(orderId: string) {
    const records: TimeRecord[] = [];
    this.dataSource.data = records;
  }

  public createNewRecord() {
    this.router.navigate([
      '/order-details/' + this.paramOrderId + /create-record/,
    ]);
  }

  public editRecord(record: ITimeRecord) {
    this.router.navigate([
      '/order-details/' + this.paramOrderId + /edit-record/ + record.id,
    ]);
  }

  public deleteRecord(record: ITimeRecord) {
    this.openDeleteRecordDialog(record.id);
  }

  public archiveRecord(record: ITimeRecord) {
    record.hasBeenPrinted = true;
  }

  public showDeleteMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500,
    };
    this.toastrService.error('Erfolgreich gelöscht', 'Eintrag', successConfig);
  }

  public showSuccessMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500,
    };
    this.toastrService.success(
      'Erfolgreich erstellt',
      'Eintrag',
      successConfig
    );
  }

  public openPrintDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(
      ConfirmPrintDialogComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe((shouldPrint) => {
      if (shouldPrint) {
        this.showPrintButton = true;
        this.showDeleteButton = true;
      }
    });
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
        this.getRecordsFromCloudDatabase(this.paramOrderId);
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRowsMinushasBeenPrinted = this.dataSource.data.filter(
      (row) => !row.hasBeenPrinted
    ).length;

    return numSelected === numRowsMinushasBeenPrinted;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : // this.dataSource.data.forEach(row => this.selection.select(row));

        this.dataSource.data.forEach((row) => {
          if (!row.hasBeenPrinted) {
            this.selection.select(row);
          }
        });
  }

  private getFormattedDate(date) {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return day + '.' + month + '.' + year;
  }

  public print() {
    this.pdf.setFont('Helvetica');
    this.pdf.setFontSize(12);

    const records = [];
    const recordsToSave = [];

    this.selection.selected.forEach((selectedRecord) => {
      recordsToSave.push(selectedRecord);
      records.push([
        this.getFormattedDate(selectedRecord.date.toDate()),
        selectedRecord['description'],
        selectedRecord['workingHours'],
        selectedRecord['employee'],
      ]);
    });

    const customerInfo = document.getElementById('customer-info');

    const date = customerInfo.children[0].children[0].childNodes[0].childNodes[1].textContent.trim();
    const customerName = customerInfo.children[0].children[0].childNodes[1].childNodes[1].textContent.trim();

    const location = customerInfo.children[0].children[1].childNodes[0].childNodes[1].textContent.trim();
    const contactPerson = customerInfo.children[0].children[1].childNodes[1].childNodes[1].textContent.trim();

    this.pdf.text(
      'Forstbetrieb Tschabi | Hochkreuthweg 3 | 87642 Trauchgau',
      12,
      20
    );

    this.pdf.text('Datum: ', 12, 39);
    this.pdf.text(date, 42, 359);

    this.pdf.text('Kunde: ', 12, 46);
    this.pdf.text(customerName, 42, 46);

    this.pdf.text('Ort: ', 12, 53);
    this.pdf.text(location, 42, 53);

    this.pdf.text('Einsatzleiter: ', 12, 60);
    this.pdf.text(contactPerson, 42, 60);

    this.pdf.autoTable({
      head: [['Datum', 'Beschreibung', 'Arbeitsstunden', 'Arbeiter']],
      body: records,
      margin: { top: 78 },
      pageBreak: 'auto',
      showHead: 'everyPage',
      showFoot: 'everyPage',
    });

    this.updateRecordsInFirestore(recordsToSave);
    this.loadLogo();
    this.saveAsPdf();
  }

  private loadLogo() {
    this.loadImage('assets/img/logo100px.png').then(
      (logo: HTMLImageElement) => {
        this.pdf.addImage(logo, 'PNG', 170, 17, 24, 24);
        this.loadFooterImage();
      }
    );
  }

  private loadFooterImage() {
    this.loadImage('assets/img/letter_footer.png').then((logo) => {
      this.pdf.addSvgAsImage('assets/letter_footer.svg', 200, 12, 200, 100);
    });
  }

  private saveAsPdf() {
    const dateNow = moment().format('DD.MM.YYYY HH.MM');
    const filename = 'Regienstunden ' + dateNow + '.pdf';
    this.pdf.save(filename);
  }

  private updateRecordsInFirestore(records: ITimeRecord[]) {
    records.forEach((record) => {
      record.hasBeenPrinted = true;
      this.firestoreRecordService.updateRecord(record.orderId, record);
    });
  }

  private loadImage(url) {
    return new Promise((resolve) => {
      let img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  }

  public showEditAndDeleteButton(selectedRecord: ITimeRecord) {
    this.selectedRecord = selectedRecord;
    if (
      this.highlighted.selected.length == 0 ||
      selectedRecord.hasBeenPrinted
    ) {
      this.showButtonsIfRecordIsSelected = false;
    } else {
      this.showButtonsIfRecordIsSelected = true;
    }
  }
}
