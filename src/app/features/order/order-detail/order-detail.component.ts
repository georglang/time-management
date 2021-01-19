import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { DateAdapter } from '@angular/material/core';
import { WorkingHour, IWorkingHour } from '../../working-hour/WorkingHour';
import { IOrder } from '../Order';

import { FirestoreOrderService } from '../services/firestore-order-service/firestore-order.service';
import { FirestoreWorkingHourService } from '../../working-hour/services/firestore-working-hour-service/firestore-working-hour.service';

import { ConfirmDeleteDialogComponent } from '../../working-hour/confirm-delete-dialog/confirm-delete-dialog.component';
import { ToastrService } from 'ngx-toastr';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import { SettingsDialogComponent } from '../../working-hour/settings-dialog/settings-dialog.component';

interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.sass'],
})
export class OrderDetailComponent implements OnInit {
  public paramOrderId;
  public _isOnline;
  public sumOfWorkingHours;
  public order: IOrder;
  public columns: string[];
  public totalTime = 0.0;
  public workingHours: IWorkingHour[] = [];
  public displayedColumns = [
    'select',
    'date',
    'description',
    'workingHours',
    'employee',
    'tool',
    'hasBeenPrinted',
  ];
  public dataSource: MatTableDataSource<IWorkingHour>;
  public hasWorkingHoursFound: boolean = false;
  public dateFormated;
  public selection = new SelectionModel<IWorkingHour>(true, []);

  public highlighted = new SelectionModel<IWorkingHour>(false, []);
  public selectedWorkingHour: IWorkingHour;
  public showButtonsIfWorkingHourIsSelected: boolean = false;
  public showPrintButton: boolean = false;
  public showDeleteButton: boolean = false;
  public pdf = new jsPDF() as jsPDFWithPlugin;
  public selected = false;
  public customerData;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateAdapter: DateAdapter<Date>,
    private toastrService: ToastrService,
    public dialog: MatDialog,
    private firestoreOrderService: FirestoreOrderService,
    private firestoreWorkingHourService: FirestoreWorkingHourService
  ) {
    this.dateAdapter.setLocale('de');
    this.columns = ['Date', 'Description', 'Time', 'Delete', 'Tool'];
    this.sumOfWorkingHours = 0;
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.paramOrderId = params['id'];
      this.getOrderByIdFromCloudDatabase(this.paramOrderId);
    });
  }

  public navigateToOrderList(): void {
    this.router.navigate(['/']);
  }

  public getOrderByIdFromCloudDatabase(orderId: string) {
    this.firestoreOrderService.getOrderById(orderId).then((order: IOrder) => {
      if (order !== undefined) {
        this.order = order;
        this.getWorkingHoursFromCloudDatabase(orderId);
      }
    });
  }

  public getWorkingHoursFromCloudDatabase(orderId: string): any {
    if (this.firestoreOrderService !== undefined) {
      this.firestoreWorkingHourService
        .getWorkingHoursByOrderId(orderId)
        .subscribe((workingHours: any[]) => {
          this.order.workingHours = workingHours;
          const workingHoursSortedByDate = this.order.workingHours.sort(
            (a, b) => b.date.toMillis() - a.date.toMillis()
          );
          this.setWorkingHoursDataSource(workingHoursSortedByDate);
        });
    }
  }

  public setWorkingHoursDataSource(workingHours: IWorkingHour[]) {
    if (workingHours.length > 0) {
      this.dataSource = new MatTableDataSource<IWorkingHour>(workingHours);
      this.hasWorkingHoursFound = true;
    } else {
      this.dataSource = new MatTableDataSource<IWorkingHour>();
      this.sumOfWorkingHours = 0;
      this.hasWorkingHoursFound = false;
    }
  }

  public getWorkingHours(orderId: string) {
    const workingHours: WorkingHour[] = [];
    this.dataSource.data = workingHours;
  }

  public createNewWorkingHour() {
    this.router.navigate([
      'working-hours/order-details/' + this.paramOrderId + /create-entry/,
    ]);
  }

  public editWorkingHour(workingHour: IWorkingHour) {
    this.router.navigate([
      'working-hours/order-details/' +
        this.paramOrderId +
        /edit-working-hour/ +
        workingHour.id,
    ]);
  }

  public deleteWorkingHour(workingHour: IWorkingHour) {
    this.openDeleteWorkingHourDialog(workingHour.id);
  }

  public archiveWorkingHour(workingHour: IWorkingHour) {
    workingHour.hasBeenPrinted = true;
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

  public openSettingsDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(SettingsDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((shouldPrint) => {
      if (shouldPrint) {
        this.showPrintButton = true;
        this.showDeleteButton = true;
      }
    });
  }

  public openDeleteWorkingHourDialog(workingHourId: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(
      ConfirmDeleteDialogComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe((shouldDelete) => {
      if (shouldDelete) {
        this.deleteWorkingHourInFirebase(workingHourId);
      }
    });
  }

  public deleteWorkingHourInFirebase(workingHourId: string): void {
    this.firestoreWorkingHourService
      .deleteWorkingHours(this.paramOrderId, workingHourId)
      .then((data) => {
        this.showDeleteMessage();
        this.getWorkingHoursFromCloudDatabase(this.paramOrderId);
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
      : this.dataSource.data.forEach((row) => this.selection.select(row));

    // this.dataSource.data.forEach((row) => this.selection.select(row));
    this.dataSource.data.forEach((row) => {
      if (!row.hasBeenPrinted) {
        this.selection.select(row);
      }
    });
  }

  private updateWorkingHoursInFirestore(workingHours: IWorkingHour[]) {
    workingHours.forEach((workingHour) => {
      workingHour.hasBeenPrinted = true;
      this.firestoreWorkingHourService
        .updateWorkingHour(workingHour.orderId, workingHour)
        .then(() => {
          this.getWorkingHoursFromCloudDatabase(this.paramOrderId);
        });
    });
  }

  public showEditAndDeleteButton(selectedWorkingHour: IWorkingHour) {
    this.selectedWorkingHour = selectedWorkingHour;
    if (
      this.highlighted.selected.length == 0 ||
      selectedWorkingHour.hasBeenPrinted
    ) {
      this.showButtonsIfWorkingHourIsSelected = false;
    } else {
      this.showButtonsIfWorkingHourIsSelected = true;
    }
  }

  //  print PDF - start
  public print() {
    this.autoTableConfig(this.getSelectedWorkingHours().workingHours);
    this.loadImage('./assets/img/logo100px.png').then(
      (logo: HTMLImageElement) => {
        this.addContentToEveryPage(this.pdf, logo);
        this.saveAsPdf();
        this.updateWorkingHoursInFirestore(
          this.getSelectedWorkingHours().workingHoursToSave
        );
      }
    );
  }

  private getSelectedWorkingHours() {
    const workingHours = [];
    const workingHoursToSave = [];

    this.selection.selected.forEach((selectedWorkingHour) => {
      workingHoursToSave.push(selectedWorkingHour);

      workingHours.push([
        this.getFormattedDate(selectedWorkingHour.date.toDate()),
        selectedWorkingHour['description'],
        selectedWorkingHour['workingHours'],
        selectedWorkingHour['employee'],
        selectedWorkingHour['tool'],
      ]);
    });
    return {
      workingHours: workingHours,
      workingHoursToSave: workingHoursToSave,
    };
  }

  private getFormattedDate(date) {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return day + '.' + month + '.' + year;
  }

  private getCustomerDataFromHTML() {
    const customerInfo = document.getElementById('customer-info');
    const date = customerInfo.children[0].children[0].childNodes[1].childNodes[0].textContent.trim();
    const customerName = customerInfo.children[0].children[1].childNodes[1].textContent.trim();
    const location = customerInfo.children[1].children[0].children[1].textContent.trim();
    const contactPerson = customerInfo.children[1].children[1].children[1].textContent.trim();
    return {
      date: date,
      customerName: customerName,
      location: location,
      contactPerson: contactPerson,
    };
  }

  private autoTableConfig(workingHours) {
    this.pdf.autoTable({
      head: [['Datum', 'Beschreibung', 'Stunden', 'Arbeiter', 'Gerät']],
      headStyles: { fillColor: [67, 120, 61] },
      body: workingHours,
      margin: {
        top: 78,
        right: 15,
        bottom: 55,
      },
      pageBreak: 'auto',
      showFoot: true,
    });
  }

  private addContentToEveryPage(doc, logo) {
    const numberOfPages = doc.internal.getNumberOfPages();
    const pdfPages = doc.internal.pages;

    for (let i = 1; i < pdfPages.length; i++) {
      doc.setPage(i);
      this.addHeaderToEveryPage(logo);
      this.addFooter(doc, i, numberOfPages);
    }
  }

  private addHeaderToEveryPage(logo) {
    this.customerData = this.getCustomerDataFromHTML();
    this.pdf.addImage(logo, 'PNG', 170, 17, 24, 24);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(12);

    this.pdf.text(
      'Forstbetrieb Tschabi | Hochkreuthweg 3 | 87642 Trauchgau',
      12,
      20
    );

    this.pdf.text('Datum: ', 12, 39);
    this.pdf.text(this.customerData.date, 42, 39);

    this.pdf.text('Kunde: ', 12, 46);
    this.pdf.text(this.customerData.customerName, 42, 46);

    this.pdf.text('Ort: ', 12, 53);
    this.pdf.text(this.customerData.location, 42, 53);

    this.pdf.text('Einsatzleiter: ', 12, 60);
    this.pdf.text(this.customerData.contactPerson, 42, 60);
  }

  private addFooter(doc: any, i: number, numberOfPages: any) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(
      'Hiermit bestätigt bzw. akzeptiert der oben genannte Auftraggeber, die Angaben der vollbrachten Arbeiten,\nsowie die geleisteten Arbeitsstunden, die dann in Rechnung gestellt werden.\n \n Vielen Dank für Ihren Auftrag \n\n Mit freundlichen Grüßen \n Matthias Tschabi ',
      12,
      250
    );

    doc.text(
      'Seite ' + String(i) + ' von ' + String(numberOfPages),
      doc.internal.pageSize.width / 2,
      287,
      {
        align: 'center',
      }
    );
  }

  private loadImage(url: string) {
    return new Promise((resolve) => {
      let img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
      resolve(img);
    });
  }

  private saveAsPdf() {
    const filename =
      'Regienstunden - ' +
      this.customerData.date +
      ' - ' +
      this.customerData.customerName +
      '.pdf';
    this.pdf.save(filename);
  }
  //  print PDF - end
}
