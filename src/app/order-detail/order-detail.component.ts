import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { IndexedDBService } from '../service/indexedDb-service/indexedDb.service';
import { DateAdapter } from '@angular/material/core';
import { TimeRecord, ITimeRecord } from '../data-classes/TimeRecords';
import { ConfirmDeleteDialogComponent } from './../confirm-delete-dialog/confirm-delete-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { FirestoreOrderService } from '../service/firestore-order-service/firestore-order.service';
import { FirestoreRecordService } from '../service/firestore-record-service/firestore-record.service';
import { SynchronizeIdxDBWithFirebaseService } from '../service/synchronize-idxDb-with-firebase-service/synchronize-idxDb-with-firebase.service';
import { MessageService } from '../service/message-service/message.service';

declare var jsPDF: any;
import 'jspdf-autotable';
import * as moment from 'moment';
import { ConnectionService } from 'ng-connection-service';
import { IOrder } from '../data-classes/Order';
moment.locale('de');

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
  public displayedColumns = ['date', 'description', 'workingHours', 'action'];
  public dataSource: MatTableDataSource<ITimeRecord>;
  public hasRecordsFound: boolean = false;
  private orderIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateAdapter: DateAdapter<Date>,
    private indexedDbService: IndexedDBService,
    private toastrService: ToastrService,
    public dialog: MatDialog,
    private readonly connectionService: ConnectionService,
    private firestoreOrderService: FirestoreOrderService,
    private firestoreRecordService: FirestoreRecordService,
    private synchronizeIdxDBWithFirebase: SynchronizeIdxDBWithFirebaseService,
    private messageService: MessageService
  ) {
    this.dateAdapter.setLocale('de');
    this.columns = ['Date', 'Description', 'Time', 'Delete'];
    this.sumOfWorkingHours = 0;

    if (window.indexedDB) {
      console.log('IndexedDB is supported');
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.paramOrderId = +params['id'];

      // if (this.isOnline()) {
      //   this.getOrderByIdFromCloudDatabase(this.paramOrderId);
      // }

      // if (this.isOnline()) {
      //   this.getRecords(this.paramId);
      // } else {
      //   console.log('Get records from indexedDB');
      // }

      // this.getOrderById(this.paramId);
      this.getOrderByIdFromIndexedDbOrders(this.paramOrderId);

      // this.getRecordsFromRecordsOutbox(this.paramId).then(records => {
      //   if (records !== undefined) {
      //     this.records = records;
      //     this.dataSource = new MatTableDataSource<ITimeRecord>(this.records);
      //   }
      // });

      // this.records = this.getRecordsFromRecordsOutbox(this.paramId);
    });

    this.connectionService.monitor().subscribe(isOnline => {
      if (this._isOnline) {
        this.indexedDbService.getOrdersFromOrdersOutbox().then(orders => {
          if (orders.length !== 0) {
            orders.forEach(order => {
              const id = order.id;
              delete order.id;
              this.firestoreOrderService.addOrder(order).then(() => {
                this.indexedDbService.getOrdersFromOrdersTable().then(ordersInIndexedDB => {
                  ordersInIndexedDB.forEach(cachedOrder => {
                    this.orderIds.push(cachedOrder.id);
                  });
                  orders.forEach(_order => {
                    if (!this.orderIds.includes(_order.id)) {
                      this.indexedDbService.addToOrdersTable(order).then(() => {
                        this.indexedDbService.deleteOrderInOrdersOutbox(id);
                      });
                    }
                  });
                });
              });
            });
          }
        });
      }
    });
  }

  public isOnline() {
    return navigator.onLine;
  }

  public navigateToOrderList(): void {
    this.router.navigate(['/']);
  }

  //
  // Online Handling
  //

  public getOrderByIdFromCloudDatabase(orderId: string) {
    this.firestoreOrderService.getOrderById(orderId).subscribe((order: IOrder) => {
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
      records.forEach(record => {
        this.sumOfWorkingHours += record.workingHours;
      });
    }
  }

  //
  // Offline
  //

  public getOrderByIdFromIndexedDbOrders(orderId: number) {
    this.indexedDbService.getOrderById(orderId).then((order: IOrder[]) => {
      if (order.length > 0) {
        this.order = order[0];
        this.setRecordDataSource(this.order.records);
      }
    });
  }

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
      console.log('Get Data from Indexed DB');
    }
  }

  public getRecordsFromOrdersOutbox(orderId: string) {
    this.indexedDbService.getOrdersFromOrdersOutbox().then(records => {
      // records.forEach(record => {
      //   record.date = new Date(record.date);
      // });

      console.log('Records from Outbox', records);
      // this.dataSource = new MatTableDataSource<ITimeRecord>(records);
    });
  }

  public getRecordsFromRecordsOutbox(orderId: string): Promise<any> {
    return this.indexedDbService.getRecordsFromRecordsOutboxTable().then(records => {
      return records;
    });
  }

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
    this.router.navigate(['/order-details/' + this.paramOrderId + /create-record/]);
  }

  public editRecord(id: any) {
    this.router.navigate(['/order-details/' + this.paramOrderId + /edit-record/ + id]);
  }

  public deleteRecord(recordId) {
    this.openDeleteRecordDialog(recordId);
  }

  public showDeleteMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500
    };
    this.toastrService.error('Erfolgreich gelöscht', 'Eintrag', successConfig);
  }

  public showSuccessMessage() {
    const successConfig = {
      positionClass: 'toast-bottom-center',
      timeout: 500
    };
    this.toastrService.success('Erfolgreich erstellt', 'Eintrag', successConfig);
  }

  public openDeleteRecordDialog(recordId: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(shouldDelete => {
      if (shouldDelete) {
        this.deleteRecordInFirebase(recordId);
      }
    });
  }

  public deleteRecordInFirebase(recordId: string): void {
    this.firestoreRecordService.deleteRecord(this.paramOrderId, recordId).then(data => {
      this.showDeleteMessage();
      // load records after deletion
      this.getRecordsFromCloudDatabase(this.paramOrderId);

      // ToDo Offline Handling
      // delete record in indexedDB orders table
      // this.indexDbService.deleteRecordInOrdersTable(this.paramId, _recordId).then(() => {
      //   this.messageService.recordDeletedSuccessful();
      // });
    });

    this.indexedDbService.deleteRecordInOrdersTable(this.paramOrderId, recordId).then(data => {});
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
      // const formattedDate = moment(record['date']).format('DD.MM.YYYY');
      // const formattedDate = moment(record['date']);
      recordsToPrint.push(
        new TimeRecord(record.date, record['description'], record['workingHours'], '', '')
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

  public synchronizeWithOrdersTable() {
    this.synchronizeIdxDBWithFirebase.synchronizeIndexedDbOrdersOutboxTableWithFirebase();
  }

  // Beim allgemeinen synchronisieren muss zuerst herausgefunden werden, was ueberhaut sychronisiert werden muss
  // Erstellen Order und Record Offline: schauen in ordersOutbox
  public synchronizeOrdersAndRecords() {
    this.synchronizeIdxDBWithFirebase.synchronizeWithFirebase();
  }

  public updateRecords() {
    const newRecord = {
      date: new Date(),
      description: 'Servus Servus',
      workingHours: 2222,
      id: 1,
      orderId: 'TyclJFilyldgrBb7GR3J'
    };

    this.indexedDbService.updateRecordInRecordsOutboxTable(newRecord);
  }
}
