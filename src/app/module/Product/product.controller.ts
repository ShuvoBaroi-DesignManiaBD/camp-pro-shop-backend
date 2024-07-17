import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { ProductServices } from './product.service';

// Below you can see the application of catchAsync function. 
const createProduct = catchAsync(async (req:Request, res:Response) => {
  // Below is the sample code to show you how to call the service function and pass parameter to it. 
  const result = await ProductServices.createProduct(req.body);

  // Below you can see the use of custom sendResponse function to make the code base clean. 
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Product created succesfully',
    data: result,
  });
})

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.getAllProducts();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Products retrieved successfully",
    data: result,
  });
});

const getAProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.getAProduct(req?.params?.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "A product retrieved successfully",
    data: result,
  });
});

const updateAProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.updateAProduct(req?.params?.id, req?.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteAProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.deleteAProduct(req?.params?.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product deleted successfully",
    data: result,
  });
});

export const ProductControllers = {
  createProduct,
  getAllProducts,
  getAProduct,
  updateAProduct,
  deleteAProduct
 };