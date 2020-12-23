import { Timestamp } from '@firebase/firestore-types';

export interface INote {
  id?: string;
  date: Timestamp;
  description: string;
  uploadUrl: string;
  orderId: string;
}

export class Note implements INote {
  public date: Timestamp;
  public description: string;
  public uploadUrl: string;
  public orderId: string;

  constructor(
    date: Timestamp,
    description: string,
    uploadUrl: string,
    orderId: string
  ) {
    this.date = date;
    this.description = description;
    this.uploadUrl = uploadUrl;
    this.orderId = orderId;
  }
}
