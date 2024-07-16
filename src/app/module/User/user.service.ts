/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { User } from "./user.model";
import { TUser } from "./user.interface";
import { Customer } from "../Customer/customer.model";


const createCustomer = async (payload: TUser) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    payload.role = 'customer';
    const createUser = await User.create(payload);
    const result = await Customer.create(
      {
        user: createUser?._id,
        email: createUser?.email,
        cart: [],
        isDeleted: false
      }
    );
    await session.commitTransaction();
    await session.endSession();
    return (result as any)?._doc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

export const UserServices = {
  createCustomer
}