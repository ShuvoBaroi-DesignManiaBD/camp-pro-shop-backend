import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { UserServices } from './user.service';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';

// Below you can see the application of catchAsync function. 
const createCustomer = catchAsync(async (req:Request, res:Response) => {
  // Below is the sample code to show you how to call the service function and pass parameter to it. 
  const result = await UserServices.createCustomer(req.body);

  // Below you can see the use of custom sendResponse function to make the code base clean. 
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Customer created succesfully',
    data: result,
  });
})


export const UserControllers = {
  createCustomer,
 };