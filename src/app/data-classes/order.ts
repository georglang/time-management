import { ITimeRecord, TimeRecord } from './time-record';

export interface IOrder {
  companyName: string;
  contactPerson?: string;
  id: string; // primery key, autoincremented by indexedDB
  location: string;
  recordIds: string[];
  records?: TimeRecord[];
}

export class Order implements IOrder {
  public companyName: string;
  public contactPerson: string;
  public id: string;
  public location: string;
  public records: TimeRecord[];
  public recordIds: string[];

  constructor(
    companyName: string,
    location: string,
    record: TimeRecord,
    id: string,
    contactPerson?: string
  ) {
    this.companyName = companyName;
    this.location = location;
    this.id = id;
    this.recordIds = [];
    this.records.push(record);
    if (contactPerson) {
      this.contactPerson = contactPerson;
    }
  }
}
