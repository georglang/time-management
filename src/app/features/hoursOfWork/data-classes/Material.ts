import { Timestamp } from '@firebase/firestore-types';

export interface IMaterial {
  id?: string;
  date: Timestamp;
  material: string;
  amount: number;
  unit: string;
  orderId: string;
}

export class Material implements IMaterial {
  public date: Timestamp;
  public material: string;
  public amount: number;
  public unit: string;
  public orderId: string;

  constructor(
    date: Timestamp,
    material: string,
    amount: number,
    unit: string,
    orderId: any
  ) {
    this.date = date;
    this.material = material;
    this.amount = amount;
    this.unit = unit;
    this.orderId = orderId;
  }
}
