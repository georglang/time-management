export interface ITimeRecord {
  id?: number; // primery key, autoincremented
  customer: string;
  date: string;
  workDescription: string;
  workingHours: number;
  place: string;
}

export class TimeRecord implements ITimeRecord {
  public id: number;
  public customer: string;
  public date: string;
  public workDescription: string;
  public workingHours: number;
  public place: string;

  constructor(customer: string, date: string, workDescription: string, workingHours: number, place: string, id?: number) {
    this.customer = customer;
    this.date = date;
    this.workDescription = workDescription;
    this.workingHours = workingHours;
    this.place = place;
    if (id) {
      this.id = id;
    }
  }

  public log() {
    console.log('RESULT: ', JSON.stringify(this));
  }
}
