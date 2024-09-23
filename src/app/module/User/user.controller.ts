import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { UserServices } from './user.service';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';


const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const {users, totalUsers} = await UserServices.getAllUsers(req?.query);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All orders retrieved successfully",
    totalOrders: totalUsers,
    data: users,
  });
});

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

const updateAUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.updateAUser(req?.params?.id, req?.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product updated successfully",
    data: result,
  });
});

const updateProfilePhoto = catchAsync(async (req: Request, res: Response) => {
  console.log(req?.body);
  
  const result = await UserServices.updateProfilePhoto(req?.body?.userId, req?.body?.profileImage);

  res.attachment
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile photo updated successfully!",
    data: result,
  });
});

export const UserControllers = {
  getAllUsers,
  createCustomer,
  updateAUser,
  updateProfilePhoto
 };