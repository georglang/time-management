import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { TimeRecord, ITimeRecord } from "../data-classes/TimeRecords";
import { DateAdapter } from "@angular/material/core";
import { FirestoreOrderService } from "../service/firestore-order-service/firestore-order.service";
import { FirestoreRecordService } from "../service/firestore-record-service/firestore-record.service";
import { MessageService } from "../service/message-service/message.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-edit-record",
  templateUrl: "./edit-record.component.html",
  styleUrls: ["./edit-record.component.sass"],
})
export class EditRecordComponent implements OnInit {
  public editRecordForm: FormGroup;
  private recordId: string;
  private orderId: string;
  public formatedDate: string;
  public record: ITimeRecord;

  public employees = [
    {
      value: "Speer Leonhard",
      viewValue: "Speer Leonhard",
    },
    {
      value: "Strobel Martin",
      viewValue: "Strobel Martin",
    },
    {
      value: "Erle Wastl",
      viewValue: "Erle Wastl",
    },
    {
      value: "Martin Johann",
      viewValue: "Martin Johann",
    },
    {
      value: "Greisl Martin",
      viewValue: "Greisl Martin",
    },
    {
      value: "Tschabi Matthias",
      viewValue: "Tschabi Matthias",
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    private firestoreRecordService: FirestoreRecordService,
    private messageService: MessageService,
    private toastrService: ToastrService
  ) {
    this.dateAdapter.setLocale("de");
  }

  ngOnInit() {
    this.editRecordForm = this.formBuilder.group({
      id: [""],
      date: ["", Validators.required],
      description: ["", Validators.required],
      workingHours: [0, Validators.required],
      employee: ["", Validators.required],
    });

    this.route.parent.url.subscribe((urlPath) => {
      this.orderId = urlPath[1].path;
    });

    this.route.params.subscribe((params) => {
      this.recordId = params["id"];

      if (this.isOnline()) {
      }
      this.getRecordByIdFromFirebase(this.orderId, this.recordId);
    });
  }

  public isOnline(): boolean {
    return navigator.onLine;
  }

  public getRecordByIdFromFirebase(orderId: string, recordId: string): void {
    this.firestoreRecordService
      .getRecordsByOrderId(orderId)
      .subscribe((records: ITimeRecord[]) => {
        if (records !== undefined) {
          records.forEach((record) => {
            if (record.id === recordId) {
              this.setControl(record);
            }
          });
        }
      });
  }

  public navigateToOrderList(): void {
    this.router.navigate(["/order-details", this.orderId]);
  }

  public setControl(record: ITimeRecord): void {
    this.editRecordForm.setValue({
      id: record.id,
      date: record.date,
      description: record.description,
      workingHours: record.workingHours,
      employee: record.employee,
    });
  }

  public onSubmit() {
    const record = new TimeRecord(
      this.editRecordForm.controls.date.value,
      this.editRecordForm.controls.description.value,
      this.editRecordForm.controls.workingHours.value,
      this.editRecordForm.controls.employee.value,
      this.recordId,
      this.orderId
    );

    this.firestoreRecordService
      .checkIfRecordExistsInOrderInFirestore(record)
      .then((doesRecordExist) => {
        if (!doesRecordExist) {
          this.updateRecordInFirestore(this.orderId, record);
        } else {
          this.messageService.recordAlreadyExists();
        }
      });
  }

  private updateRecordInFirestore(orderId: string, record: ITimeRecord): void {
    if (this.firestoreRecordService !== undefined) {
      this.firestoreRecordService.updateRecord(orderId, record).then((data) => {
        this.showUpdateMessage();
      });
    }
  }

  private showUpdateMessage() {
    const successConfig = {
      positionClass: "toast-bottom-center",
      timeout: 500,
    };
    this.toastrService.success(
      "Erfolgreich aktualisiert",
      "Eintrag",
      successConfig
    );
  }
}
