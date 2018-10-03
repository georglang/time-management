import { Injectable } from '@angular/core';
import { Database } from './Database';
import { TimeRecord } from '../data-classes/time-record';

@Injectable()
export class IndexDBService {
  constructor(private timeRecordsDb: Database) {
    console.log('Dexie Table', this.timeRecordsDb);
  }

  public insertOneRecord() {
    const record = new TimeRecord('Lang', '20.20.20', 'Arbeit', 10.00, 'Wolfskopf');
    this.timeRecordsDb.records.add(record).then(() => {
      return this.timeRecordsDb.records.where('workingHours').below(20).toArray;
    });
  }

  public getAllRecords(): Promise<any> {
    return this.timeRecordsDb.records.toArray().then(result => {
      return result;
    }).catch((e) => {
      console.error('IndexDB getAllRecords: ', e);
    });
  }

  public add(data) {
    // return this.table.add(data);
  }

  public update(id, data) {
    // return this.table.update(id, data);
  }

  public remove(id) {
    // return this.table.delete(id);
  }
}
