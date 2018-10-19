export interface ITimeRecord {
  id: string; // primery key, autoincremented
  date: string;
  description: string;
  workingHours: number;
  location: string;
}

export class TimeRecord implements ITimeRecord {
  public id: string;
  public date: string;
  public description: string;
  public workingHours: number;
  public location: string;

  constructor(date: string, workDescription: string, workingHours: number, location: string, id: string) {
    this.date = date;
    this.description = workDescription;
    this.workingHours = workingHours;
    this.location = location;
    this.id = id;
  }

  public log() {
    console.log('RESULT: ', JSON.stringify(this));
  }
}
