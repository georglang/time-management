import { TimeRecord } from './time-record';

export interface IOrder {
  companyName: string;
  contactPerson?: string;
  id?: number; // primery key, autoincremented by indexDB
  place: string;
  records?: TimeRecord[];
}

export class Order implements IOrder {
  public companyName: string;
  public contactPerson: string;
  public id: number;
  public place: string;
  public records: TimeRecord[];

  constructor(companyName: string, place: string, contactPerson?: string, id?: number, records?: TimeRecord[]) {
    this.companyName = companyName;
    this.place = place;
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
