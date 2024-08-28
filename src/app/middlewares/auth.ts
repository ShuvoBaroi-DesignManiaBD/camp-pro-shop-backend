import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/AppError";
import catchAsync from "../utils/catchAsync";
import { TUserRole } from "../module/User/user.interface";
import { User } from "../module/User/user.model";
import { createToken, verifyToken } from "../module/Auth/auth.utils";

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let user;
    let userRole;
    let userDeleted = false;
    let JwtPayload;
    let accessToken = req.cookies?.accessToken || req.headers?.accesstoken;
    const refreshToken = req.cookies?.refreshToken || req.headers?.refreshToken;

    // checking if the token is missing
    if (!accessToken && !refreshToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    } else if (!accessToken && refreshToken) {
      // verify the refresh token
      const decodedFromRefreshToken = verifyToken(
        refreshToken,
        config.jwt_refresh_key
      );

      const { role, email } = decodedFromRefreshToken;
      userRole = role;
      // checking if the user is exist
      user = await User.isUserExistsByEmail(email);

      // checking if the user is already deleted
      userDeleted = user?.isDeleted;

      JwtPayload = {
        role: role,
        email: email,
      };
    } else if (accessToken) {
      // checking if the given token is valid
      const decoded = jwt.verify(
        accessToken,
        config.jwt_access_key as string
      ) as JwtPayload;

      const { role, email } = decoded;

      // checking if the user is exist
      user = await User.isUserExistsByEmail(email);

      userRole = role;
      // checking if the user is already deleted
      userDeleted = user?.isDeleted;
    }

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
    }

    if (userDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
    }

    if (requiredRoles && !requiredRoles.includes(userRole)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    if (JwtPayload) {
      // Creating access token
      accessToken = createToken(
        JwtPayload,
        config.jwt_access_key as string,
        config.jwt_access_expires_in as string
      );
    }

    req.user = JwtPayload as JwtPayload;
    next();
  });
};

export default auth;
