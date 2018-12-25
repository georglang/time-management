import { ITimeRecord, TimeRecord } from './time-record';

export interface IOrder {
  companyName: string;
  contactPerson?: string;
  id: string; // primery key, autoincremented by indexedDB
  location: string;
  records?: TimeRecord[];
  dbId?: string;
  createdAt: Date;
}

export class Order implements IOrder {
  public companyName: string;
  public contactPerson: string;
  public id: string;
  public location: string;
  public records: TimeRecord[];
  public dbId: string;
  public createdAt: Date;

  constructor(
    companyName: string,
    location: string,
    createdAt: Date,
    id?: string,
    contactPerson?: string,
    record?: TimeRecord,
    dbId?: string,
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
    if (dbId) {
      this.dbId = dbId;
    }
    this.createdAt = new Date();
  }
}
