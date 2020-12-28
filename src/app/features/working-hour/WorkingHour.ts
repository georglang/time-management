import { Timestamp } from '@firebase/firestore-types';

export interface IWorkingHour {
  date: Timestamp;
  description: string;
  workingHours: number;
  employee: string;
  id?: string; // is necessary when deleting local record after synchronization
  orderId?: string;
  hasBeenPrinted?: boolean;
}

export class WorkingHour implements IWorkingHour {
  public date: Timestamp;
  public description: string;
  public workingHours: number;
  public employee: string;
  public location: string;
  public id: string;
  public orderId: any;
  public hasBeenPrinted: boolean;

  constructor(
    date: Timestamp,
    description: string,
    workingHours: number,
    employee: string,
    id?: string,
    orderId?: string,
    hasBeenPrinted?: boolean
  ) {
    this.date = date;
    this.description = description;
    this.workingHours = workingHours;
    this.employee = employee;
    this.id = id;
    this.orderId = orderId;
    this.hasBeenPrinted = hasBeenPrinted;
  }
}
