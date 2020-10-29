// ToDo: Evt. createdAt entfernen, da nicht benoetigt
import { Timestamp } from "@firebase/firestore-types";
("@firebase/firestore-types");

export interface ITimeRecord {
  date: any;
  description: string;
  workingHours: number;
  employee: string;
  id?: string; // is necessary when deleting local record after synchronization
  orderId?: string;
  excluded?: boolean;
}

export class TimeRecord implements ITimeRecord {
  public date: any;
  public description: string;
  public workingHours: number;
  public employee: string;
  public location: string;
  public id: string;
  public orderId: any;

  constructor(
    date: any,
    description: string,
    workingHours: number,
    employee: string,
    id?: string,
    orderId?: string
  ) {
    this.date = date;
    this.description = description;
    this.workingHours = workingHours;
    this.employee = employee;
    this.id = id;
    this.orderId = orderId;
  }
}
