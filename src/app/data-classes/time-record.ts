export interface ITimeRecord {
  id?: number; // primery key, autoincremented
  customer: string;
  date: string;
  workDescription: string;
  workingHours: number;
  location: string;
}

export class TimeRecord implements ITimeRecord {
  public id: number;
  public customer: string;
  public date: string;
  public workDescription: string;
  public workingHours: number;
  public location: string;

  constructor(customer: string, date: string, workDescription: string, workingHours: number, location: string, id?: number) {
    this.customer = customer;
    this.date = date;
    this.workDescription = workDescription;
    this.workingHours = workingHours;
    this.location = location;
    if (id) {
      this.id = id;
    }
  }

  public log() {
    console.log('RESULT: ', JSON.stringify(this));
  }
}
