export interface ITimeRecord {
  date: string;
  description: string;
  workingHours: number;
  createdAt?: Date;
  id?: string;
  orderId?: string;
}

export class TimeRecord implements ITimeRecord {
  public date: string;
  public description: string;
  public workingHours: number;
  public location: string;
  public createdAt: Date;
  public id: string;
  public orderId: string;

  constructor(date: string, description: string, workingHours: number, createdAt: Date, id: string, orderId: string) {
    this.date = date;
    this.description = description;
    this.workingHours = workingHours;
    this.id = id;
    this.orderId = orderId;
  }
}
