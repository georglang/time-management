export interface ITimeRecord {
  id: string; // primery key, autoincremented
  date: string;
  description: string;
  workingHours: number;
}

export class TimeRecord implements ITimeRecord {
  public id: string;
  public date: string;
  public description: string;
  public workingHours: number;
  public location: string;

  constructor(date: string, description: string, workingHours: number, id: string) {
    this.date = date;
    this.description = description;
    this.workingHours = workingHours;
    this.id = id;
  }

  public log() {
    console.log('RESULT: ', JSON.stringify(this));
  }
}
