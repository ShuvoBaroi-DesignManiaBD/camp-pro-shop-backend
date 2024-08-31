import mongoose, { Schema, model } from 'mongoose';
import { IOrder } from './order.interface';

const cartItemSchema = new Schema({
  id: { type: String, required: [true, 'Product ID is required'] },
  quantity: { type: Number, required: [true, 'Quantity is required'] },
  totalPrice: { type: String, required: [true, 'Total is required'] },
});

const addressSchema = new Schema({
  country: { type: String, required: [true, 'Country is required'] },
  city: { type: String, required: [true, 'City is required'] },
  street: { type: String, required: [true, 'Street is required'] },
  zip: { type: Number, required: [true, 'ZIP code is required'] },
});

const orderSchema = new Schema<IOrder>({
  userId: { type: String, required: [true, 'User ID is required'] },
  email: { type: String, required: [true, 'Email is required'] },
  address: { type: addressSchema, required: [true, 'Address is required'] },
  products: { type: [cartItemSchema], required: [true, 'Products are required'] },
  orderNote: { type: String },
  currency: { type: String, enum: ['USD', 'BDT'], required: [true, 'Currency is required'] },
  quantity: { type: Number, required: [true, 'Quantity is required'] },
  totalPrice: { type: Number, required: [true, 'Total price is required'] },
  gateWay: { type: String, required: [true, 'Payment gateway is required'] },
  transactionId: { type: String },
  status: { type: String, enum: ['pending', 'paid'] }, // Enum defined as in the interface
  payerDetails: { type: Object }, // Added payer field as an optional object
  paidBy: { type: String },
  bank_tran_id: { type: String },
  tran_date: { type: String },
  currency_rate: { type: String },
}, { timestamps: true });

const Order = model<IOrder>('Order', orderSchema);

export default Order;
