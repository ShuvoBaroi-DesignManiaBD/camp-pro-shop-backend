/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { UserValidation } from "./user.validation";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "./user.constant";
import { upload } from "../../utils/uploadImageToServer";
import { convertToWebP } from "../../middlewares/convertToWebP";

const router = express.Router();

router.post(
  "/create-customer",
  validateRequest(UserValidation.newUserValidation),
  UserControllers.createCustomer
);

router.patch(
  "/update-profile-photo",
  auth(USER_ROLE?.customer, USER_ROLE?.admin),
  // parseFormDataFields,
  // uploadImageToServer,
  upload.single('file'),
  convertToWebP,
  UserControllers.updateProfilePhoto
);

router.patch(
  "/update-user/:id",
  auth(USER_ROLE?.customer, USER_ROLE?.admin),
  // upload.single('file'),
  validateRequest(UserValidation.updateUserValidation),
  UserControllers.updateAUser
);

export const userRoutes = router;
