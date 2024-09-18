import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { orderServices } from "./order.service";
import { TPayment } from "./order.interface";
import AppError from "../../errors/AppError";

// Applying the catchAsync function.
const createOrder = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  console.log(payload);

  let result;
  // Correctly call the service function based on the gateway.
  if (payload?.gateWay === 'paypal') {
    result = await orderServices.createOrderWithPaypal(payload);
  } else if (payload?.gateWay === 'sslcommerz') {
    result = await orderServices.createOrderWithSSLCZ(payload);
  } else {
    // Throw error properly to be caught by catchAsync
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid data provided!");
  }

  // Use custom sendResponse function to make the code base clean.
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Order created successfully!",
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const {orders, totalOrders} = await orderServices.getAllOrders(req?.query);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All orders retrieved successfully",
    totalOrders: totalOrders,
    data: orders,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.getMyOrders(req?.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Orders retrieved successfully",
    data: result,
  });
});

const captureOrder = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  console.log(req.body);

  let result;
  if (payload?.gateway === 'paypal') {
    result = await orderServices.captureOrderForPaypal(payload?.token);
  } else if (payload?.gateway === 'sslcommerz') {
    result = await orderServices.captureOrderForSSLCZ(payload?.token);
  } else {
    // Throw error properly to be caught by catchAsync
    throw new AppError(httpStatus.NOT_FOUND, "Order not found!");
  }

  // Use custom sendResponse function to make the code base clean.
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order data retrieved successfully!",
    data: result,
  });
});

export const OrderControllers = {
  createOrder,
  captureOrder,
  getAllOrders,
  getMyOrders
};
