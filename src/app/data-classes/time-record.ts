export interface ITimeRecord {
  id?: string;
  date: string;
  description: string;
  workingHours: number;
  createdAt: Date;
}

export class TimeRecord implements ITimeRecord {
  public id?: string;
  public date: string;
  public description: string;
  public workingHours: number;
  public location: string;
  public createdAt: Date;

  constructor(date: string, description: string, workingHours: number, createdAt: Date, id?: string) {
    this.date = date;
    this.description = description;
    this.workingHours = workingHours;
    this.id = id;
  }
}
