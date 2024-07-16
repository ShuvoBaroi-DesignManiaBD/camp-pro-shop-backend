/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';
import { USER_ROLE } from '../User/user.constant';

type CartItem = {
  productId: string; // Assuming ObjectId is represented as a string
  quantity: number;
}

export type TCustomer = {
  user: Types.ObjectId; // Assuming ObjectId is represented as a string
  email: string; 
  cart: CartItem[];
  isDeleted: boolean;
}


export interface customerModel extends Model<TCustomer> {
  isUserExistsById(email: string): Promise<TCustomer>;
  isUserExistsByEmail(email: string): Promise<TCustomer>;
}

export type TUserRole = keyof typeof USER_ROLE;