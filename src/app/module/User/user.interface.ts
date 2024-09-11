/* eslint-disable no-unused-vars */
import { Model } from "mongoose";
import { USER_ROLE } from "./user.constant";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export type TUser = {
  photo?:string;
  name: string;
  email: string;
  phone: string;
  password: string;
  address: Address;
  role?: "customer" | "admin";
  isDeleted: boolean;
};

export type TUpdateUser = {
  photo?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: Address;
  role?: "customer" | "admin";
  isDeleted?: boolean;
};

export interface UserModel extends Model<TUser> {
  //instance methods for checking if the user exist
  isUserExistsByEmail(email: string): Promise<TUser>;
  isUserExistsById(email: string): Promise<TUser>;
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}

// Create an array of TUser keys
export const TUserKeys: string[] = ['name', 'email', 'phone', 'password', 'address', 'photo', 'phone'];

export type TUserRole = keyof typeof USER_ROLE;
