import { Timestamp } from '@firebase/firestore-types';

export interface ITimeRecord {
  date: Timestamp;
  description: string;
  workingHours: number;
  employee: string;
  tool: string;
  id?: string; // is necessary when deleting local record after synchronization
  orderId?: string;
  hasBeenPrinted?: boolean;
}

export class TimeRecord implements ITimeRecord {
  public date: Timestamp;
  public description: string;
  public workingHours: number;
  public employee: string;
  public tool: string;
  public location: string;
  public id: string;
  public orderId: any;
  public hasBeenPrinted: boolean;

  constructor(
    date: Timestamp,
    description: string,
    workingHours: number,
    employee: string,
    tool: string,
    id?: string,
    orderId?: string,
    hasBeenPrinted?: boolean
  ) {
    this.date = date;
    this.description = description;
    this.workingHours = workingHours;
    this.employee = employee;
    this.tool = tool;
    this.id = id;
    this.orderId = orderId;
    this.hasBeenPrinted = hasBeenPrinted;
  }
}
