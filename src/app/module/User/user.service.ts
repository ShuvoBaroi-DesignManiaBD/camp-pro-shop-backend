/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { User } from "./user.model";
import { TUpdateUser, TUser, TUserKeys } from "./user.interface";
import { Customer } from "../Customer/customer.model";
import DataNotFoundError from "../../errors/DataNotFoundError";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { UserSearchableFields } from "./user.constant";
import UsersQueryBuilder from "../../builder/UsersQueryBuilder";


const getAllUsers = async (query: Record<string, unknown>) => {
  console.log(query);

  // Create the query builder
  const userQuery = new UsersQueryBuilder(User.find(), query)
    .search()
    .filter()
    .sort()
    .fields();

  // Clone the query for counting documents
  const countQuery = userQuery.modelQuery.clone();
  const totalMatchingDocuments = await countQuery.countDocuments().exec();
  // Execute the query to get the actual results
  userQuery.paginate();
  const users = await userQuery.modelQuery.exec();
  // Handle case where no orders are found
  if (!users || users.length < 1) {
    throw new DataNotFoundError();
  }

  return { users: users, totalUsers: totalMatchingDocuments };
};

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

// ======================= Update operations =======================
const updateAUser = async (id: string, payload: Partial<TUpdateUser>) => {
  console.log(id, payload);
  
  // Finding the user by ID
  const user = await User.findById(id);

  if (!user) {
    throw new DataNotFoundError();
  }

  // Check for invalid fields in the payload
  for (const key of Object.keys(payload)) {
    if (!TUserKeys.includes(key)) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid field: ${key}`);
    }
  }

  // Construct the update query with $set
  const updateQuery: any = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'object' && value !== null) {
      // Handle nested objects like 'address'
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (nestedValue !== undefined) {
          updateQuery[`${key}.${nestedKey}`] = nestedValue;
        }
      }
    } else if (value !== undefined) {
      // Handle top-level fields
      updateQuery[key] = value;
    }
  }

  // Perform the update with $set to modify only the specified fields
  const result = await User.findByIdAndUpdate(id, { $set: updateQuery }, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update the user!'
    );
  }

  return result;
};


// ======================= Update Profile Photo =======================
const updateProfilePhoto = async (userId:string, file:string) => {
  // Finding the user by ID
  const user = await User.findById(userId);
  console.log(userId, file);
  

  if (!user) {
    throw new DataNotFoundError();
  }

  // Perform the update with $set to modify only the specified fields
  const result = await User.findByIdAndUpdate(userId, { $set: {photo: file} }, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update the profile image!'
    );
  }

  return result;
};

export const UserServices = {
  getAllUsers,
  createCustomer,
  updateAUser,
  updateProfilePhoto
}