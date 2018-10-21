import { ITimeRecord, TimeRecord } from './time-record';

export interface IOrder {
  companyName: string;
  contactPerson?: string;
  id: string; // primery key, autoincremented by indexedDB
  location: string;
  records?: TimeRecord[];
}

export class Order implements IOrder {
  public companyName: string;
  public contactPerson: string;
  public id: string;
  public location: string;
  public records: TimeRecord[];

  constructor(
    companyName: string,
    location: string,
    contactPerson?: string,
    id: string,
    record?: TimeRecord
  ) {
    this.companyName = companyName;
    this.location = location;
    this.id = id;
    if (record) {
      this.records.push(record);
    }
    if (contactPerson) {
      this.contactPerson = contactPerson;
    }
  }
}
