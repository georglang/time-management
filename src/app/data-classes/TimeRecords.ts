// ToDo: Evt. createdAt entfernen, da nicht benoetigt
import { Timestamp } from '@firebase/firestore-types';
'@firebase/firestore-types'

export interface ITimeRecord {
  date: any;
  description: string;
  workingHours: number;
  id?: string;      // is necessary when deleting local record after synchronization
  orderId?: string;
}

export class TimeRecord implements ITimeRecord {
  public date: any;
  public description: string;
  public workingHours: number;
  public location: string;
  public id: string;
  public orderId: string;

  constructor(date: any, description: string, workingHours: number, id: string, orderId: string) {
    this.date = date;
    this.description = description;
    this.workingHours = workingHours;
    this.id = id;
    this.orderId = orderId;
  }
}
