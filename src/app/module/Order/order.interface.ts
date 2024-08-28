import { Document } from 'mongoose';

export interface cartItem {
  id: string;
  quantity: number;
  totalPrice: string;
}

export interface address {
  country: string;
  city: string;
  street: string;
  zip: number;
}

export interface IOrder extends Document {
  userId: string;
  email: string;
  address: address;
  products: cartItem[];
  orderNote: string;
  currency: 'USD'| 'BDT';
  quantity: number,
  totalPrice: number;
  gateWay: string;
  transactionId?: string;
  status?: 'pending'| 'paid';
  payerDetails?: Object;
}

