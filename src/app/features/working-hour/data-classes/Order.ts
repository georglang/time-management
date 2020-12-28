import { Timestamp } from '@firebase/firestore-types';
import { ITimeRecord } from './TimeRecords';

export interface IOrder {
  companyName: string;
  contactPerson?: string;
  date: Timestamp;
  location: string;
  records?: ITimeRecord[];
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
  public records: ITimeRecord[];
  public id: any;

  constructor(
    date: Timestamp,
    companyName: string,
    location: string,
    contactPerson?: string,
    records?: ITimeRecord[],
    id?: any
  ) {
    this.date = date;
    this.companyName = companyName;
    this.location = location;
    if (records === undefined) {
      this.records = [];
    } else {
      this.records = records;
    }
    if (contactPerson) {
      this.contactPerson = contactPerson;
    }
    if (id) {
      this.id = id;
    }
  }
}
