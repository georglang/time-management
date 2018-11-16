import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatDialog, MatDialogConfig } from '@angular/material';

import { IndexDBService } from '../service/index-db.service';
import { DateAdapter } from '@angular/material';
import { TimeRecord, ITimeRecord } from '../data-classes/time-record';
import { IOrder } from '../data-classes/order';
import { ConfirmDeleteDialogComponent } from './../confirm-delete-dialog/confirm-delete-dialog.component';
import { ToastrService, Toast } from 'ngx-toastr';

import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as moment from 'moment';
moment.locale('de');

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.sass']
})
export class OrderDetailComponent implements OnInit {
  private paramId;
  private sub;

  @Input() customer;
  public order: IOrder;
  public columns: string[];
  public totalTime = 0.0;
  public records: TimeRecord[];
  public displayedColumns = ['id', 'date', 'description', 'workingHours', 'action'];
  public dataSource: MatTableDataSource<ITimeRecord>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateAdapter: DateAdapter<Date>,
    private indexDbService: IndexDBService,
    private toastrService: ToastrService,
    public dialog: MatDialog
  ) {
    this.dateAdapter.setLocale('de');
    this.columns = ['Date', 'Description', 'Time', 'Delete'];
    this.dataSource = new MatTableDataSource<ITimeRecord>();
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.paramId = +params['id']; // (+) converts string 'id' to a number
    });

    this.getOrderById(this.paramId);
  }

  public navigateToOrderList() {
    this.router.navigate(['/']);
  }

  public deleteFormGroup(recordId: string, position: number) {
    this.indexDbService.deleteRecord(recordId, this.paramId).then(data => {});
  }

  public getOrderById(orderId) {
    this.indexDbService.getOrderById(orderId).then(order => {
      if (order.length !== 0) {
        if (order[0].hasOwnProperty('records')) {
          this.order = order[0];
          this.records = order[0].records;

          if (this.records.length !== 0) {
            console.log('Records', this.records);

            this.dataSource = new MatTableDataSource<ITimeRecord>(this.records);
          }
        }
      }
    });
  }

  public createNewRecord() {
    this.router.navigate(['/order-details/' + this.paramId + /create-record/]);
  }

  public editRecord(id: any) {
    this.router.navigate(['/order-details/' + this.paramId + /edit-record/ + id]);
  }

  public deleteRecord(recordId) {
    this.openDeleteRecordDialog(recordId);
  }

  public showDeleteMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastrService.error('Erfolgreich gelöscht', 'Eintrag', successConfig);
  }

  public showSuccessMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 2000
    };
    this.toastrService.success('Erfolgreich erstellt', 'Eintrag', successConfig);
  }

  public openDeleteRecordDialog(recordId) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      title: 'Löschen'
    };
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.indexDbService.deleteRecord(this.paramId, recordId).then(data => {
          this.getOrderById(this.paramId);
          this.showDeleteMessage();
        });
      }
    });
  }

  public print() {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    const columns = [
      { title: 'Datum', dataKey: 'date' },
      { title: 'Beschreibung', dataKey: 'description' },
      { title: 'Arbeitsstunden', dataKey: 'workingHours' }
    ];

    const recordsToPrint = [];
    this.records.forEach(record => {
      const formattedDate = moment(record['date']).format('DD.MM.YYYY');
      recordsToPrint.push(
        new TimeRecord(formattedDate, record['description'], record['workingHours'])
      );
    });

    const costomerInfo = document.getElementById('customer-info');
    pdf.fromHTML(costomerInfo, 12, 12);

    pdf.autoTable(columns, recordsToPrint, {
      bodyStyles: { valign: 'top' },
      margin: { left: 10, top: 40 },
      styles: { overflow: 'linebreak', columnWidth: 'wrap' },
      columnStyles: {
        description: { columnWidth: 'auto' }
      }
    });

    const dateNow = moment().format('DD.MM.YYYY HH.MM');
    const filename = 'Regienstunden ' + dateNow + '.pdf';
    pdf.save(filename);
    const iframe = document.createElement('iframe');
    iframe.setAttribute(
      'style',
      'position:absolute;right:0; top:0; bottom:0; height:100%; width:650px; padding:20px;'
    );
    document.body.appendChild(iframe);

    iframe.src = pdf.output('datauristring');
  }
}
