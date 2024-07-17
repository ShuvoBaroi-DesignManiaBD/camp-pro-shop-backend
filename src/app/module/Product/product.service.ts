/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { IProduct } from "./product.interface";
import { Customer } from "../Customer/customer.model";
import Product from "./product.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const createProduct = async (payload: IProduct) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const isProductExist = await Product.find({ name: payload?.name });

  if (isProductExist.length !== 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'A product with this name already exist!',
    );
  }
    const result = await Product.create(payload);
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

export const ProductServices = {
  createProduct,
};
