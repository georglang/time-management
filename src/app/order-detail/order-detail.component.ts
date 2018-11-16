import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource, MatDialog, MatDialogConfig } from '@angular/material';

import { IndexDBService } from '../service/index-db.service';
import { DateAdapter } from '@angular/material';
import { TimeRecord, ITimeRecord } from '../data-classes/time-record';
import { IOrder } from '../data-classes/order';
import { ConfirmDeleteDialogComponent } from './../confirm-delete-dialog/confirm-delete-dialog.component';
import { ToastrService, Toast } from 'ngx-toastr';

// import * as jsPDF from 'jspdf';
// import * from 'jspdf-autotable';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
// declare let jsPDF;


import * as moment from 'moment';

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
  private pdf: jsPDF;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateAdapter: DateAdapter<Date>,
    private indexDbService: IndexDBService,
    private toastrService: ToastrService,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,

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

  public onSubmit() {
  }

  public deleteFormGroup(recordId: string, position: number) {
    this.indexDbService.deleteRecord(recordId, this.paramId).then(data => {
    });
  }

  public getOrderById(orderId) {
    this.indexDbService.getOrderById(orderId).then(order => {
      console.log('Order', order[0]);
      if (order.length !== 0) {
        if (order[0].hasOwnProperty('records')) {
          this.order = order[0];
          this.records = order[0].records;

          if (this.records.length !== 0) {
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
    this.openConfirmDialog(recordId);
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

  public openConfirmDialog(recordId) {
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

          console.log('Data', data);
          this.getOrderById(this.paramId);
          this.showDeleteMessage();
        });

      }

      console.log('Dialog geschlossen');
      console.log('RESULT: ', result);
    });
  }

  public print() {

    const pdf = new jsPDF('p', 'pt', 'a4');
    const margins = {
      top: 70,
      bottom: 40,
      left: 30,
      width: 550
    };

    pdf.setFontSize(18);
    const columns = [
      { title: 'Datum', dataKey: 'date' },
      { title: 'Beschreibung', dataKey: 'description' },
      { title: 'Arbeitsstunden', dataKey: 'workingHours' },
    ];

    const recordsToPrint = this.records;

    recordsToPrint.forEach((record) => {
      delete record['id'];
      const date = record['date'];
      const formattedDate = moment(date).format('DD.MM.YYYY');
      record.date = formattedDate;
    });

    pdf.autoTable(columns, recordsToPrint, {
      bodyStyles: { valign: 'top'},
      styles: { overflow: 'linebreak', columnWidth: 'wrap'},
      columnStyles: {
        description: {columnWidth: 'auto'}
      },
      margin: {top: 60, left: 30},
  });

    pdf.fromHTML(document.getElementById('customer-info'),
      margins.left, // x coord
      margins.top,
      {
        width: margins.width// max width of content on PDF
      });

    const iframe = document.createElement('iframe');
    iframe.setAttribute('style','position:absolute;right:0; top:0; bottom:0; height:100%; width:650px; padding:20px;');
    document.body.appendChild(iframe);

    iframe.src = pdf.output('datauristring');
  }
}
