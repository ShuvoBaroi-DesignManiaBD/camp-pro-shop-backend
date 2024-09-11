/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../User/user.constant";
import { OrderControllers } from "./order.controller";

const router = express.Router();

router.post(
  "/create-order",
  auth(USER_ROLE?.admin, USER_ROLE?.customer
  ),
  // validateRequest(ProductValidation.productValidationSchema),
  OrderControllers.createOrder
);

router.post(
  "/capture-order",
  auth(USER_ROLE?.admin, USER_ROLE?.customer
  ),
  // validateRequest(ProductValidation.productValidationSchema),
  OrderControllers.captureOrder
);

router.get(
  '/my-orders',
  auth(USER_ROLE?.admin, USER_ROLE?.customer
  ), 
  OrderControllers.getMyOrders, 
);

// router.get("", orderControllers.getAllProducts);

// router.get("/:id", orderControllers.getAProduct);

// router.patch(
//   "/:id",
//   auth(USER_ROLE.admin),
//   validateRequest(ProductValidation.productUpdateSchema),
//   orderControllers.updateAProduct
// );

// router.delete("/:id", auth("admin"), orderControllers.deleteAProduct);

export const orderRoutes = router;
