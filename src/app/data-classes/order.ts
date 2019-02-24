import { TimeRecord } from './time-record';

export interface IOrder {
  companyName: string;
  contactPerson?: string;
  location: string;
  records?: TimeRecord[];
  createdAt: Date;
}

export interface IFlattenOrder {
  companyName: string;
  contactPerson: string;
  location: string;
}

export class Order implements IOrder {
  public companyName: string;
  public contactPerson: string;
  public location: string;
  public records: TimeRecord[];
  public createdAt: Date;

  constructor(
    companyName: string,
    location: string,
    createdAt: Date,
    contactPerson?: string,
    record?: TimeRecord
  ) {
    this.companyName = companyName;
    this.location = location;
    if (record) {
      this.records.push(record);
    }
    if (contactPerson) {
      this.contactPerson = contactPerson;
    }
    this.createdAt = new Date();
  }
}
