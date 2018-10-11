import { TimeRecord } from './time-record';

export interface IOrder {
  companyName: string;
  contactPerson?: string;
  id?: number; // primery key, autoincremented by indexDB
  location: string;
  records?: TimeRecord[];
}

export class Order implements IOrder {
  public companyName: string;
  public contactPerson: string;
  public id: number;
  public location: string;
  public records: TimeRecord[];

  constructor(companyName: string, location: string, contactPerson?: string, id?: number, records?: TimeRecord[]) {
    this.companyName = companyName;
    this.location = location;
    if (records) {
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
