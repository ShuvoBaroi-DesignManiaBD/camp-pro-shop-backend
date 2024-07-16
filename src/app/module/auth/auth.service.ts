/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TSignInUser } from "./auth.interface";
import { createToken } from "./auth.utils";
import config from "../../config";
import mongoose from "mongoose";
import { User } from "../User/user.model";

const signIn = async (payload: TSignInUser) => {
    // checking if the user is exists or not
    const user = await User.isUserExistsByEmail(payload.email);
    
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
    }
  
    //checking if the password is correct or not
    if (!(await User.isPasswordMatched(payload?.password, user?.password)))
      throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');


    const jwtPayload = {
      email: user.email,
      role: user.role || "customer",
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_key as string,
      config.jwt_access_expires_in as string,
    );
  
    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_key as string,
      config.jwt_refresh_expires_in as string,
    );

    return {
      user: (user as any)._doc,
      accessToken,
      refreshToken,
    };
  };

export const authServices = {
    signIn,
} 