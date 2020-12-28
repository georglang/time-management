import { Timestamp } from '@firebase/firestore-types';
import { IWorkingHour } from '../working-hour/WorkingHour';

export interface IOrder {
  companyName: string;
  contactPerson?: string;
  date: Timestamp;
  location: string;
  workingHours?: IWorkingHour[];
  id?: any;
}

export interface IFlattenOrder {
  companyName: string;
  contactPerson: string;
  location: string;
}

export class Order implements IOrder {
  public companyName: string;
  public contactPerson: string;
  public date: Timestamp;
  public location: string;
  public workingHours: IWorkingHour[];
  public id: any;

  constructor(
    date: Timestamp,
    companyName: string,
    location: string,
    contactPerson?: string,
    workingHours?: IWorkingHour[],
    id?: any
  ) {
    this.date = date;
    this.companyName = companyName;
    this.location = location;
    if (workingHours === undefined) {
      this.workingHours = [];
    } else {
      this.workingHours = workingHours;
    }
    if (contactPerson) {
      this.contactPerson = contactPerson;
    }
    if (id) {
      this.id = id;
    }
  }
}
