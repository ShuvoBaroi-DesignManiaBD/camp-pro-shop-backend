/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { IProduct, IProductKeys } from "./product.interface";
import Product from "./product.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import DataNotFoundError from "../../errors/DataNotFoundError";

const createProduct = async (payload: IProduct) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const isProductExist = await Product.find({ name: payload?.name });

    if (isProductExist.length !== 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "A product with this name already exist!"
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

const getAProduct = async (id: string) => {
  const product = await Product.findById(id);

  if (!product || product.isDeleted) {
    throw new DataNotFoundError();
  }

  return product;
};

const getAllProducts = async () => {
  const productsQuery = new QueryBuilder(
    Product.find({ isDeleted: false }),
    {}
  );
  const result = await productsQuery.modelQuery;
  return result;
};

const updateAProduct = async (id: string, payload: Partial<IProduct>) => {
  // Finding the product by ID
  const product = await Product.findById(id);

  if (!product) {
    throw new DataNotFoundError();
  }

  // Check for invalid fields in the payload
  for (const key of Object.keys(payload)) {
    if (!IProductKeys.includes(key)) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid field: ${key}`);
    }
  }

  // Perform the update
  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update the product!"
    );
  }

  return result;
};

const deleteAProduct = async (id: string) => {
  const result = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to delete the product");
  }
  return result;
};

export const ProductServices = {
  createProduct,
  getAllProducts,
  getAProduct,
  updateAProduct,
  deleteAProduct
};
