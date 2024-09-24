import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { ProductServices } from './product.service';

// Below you can see the application of catchAsync function. 
const createProduct = catchAsync(async (req:Request, res:Response) => {
  // Below is the sample code to show you how to call the service function and pass parameter to it. 
  console.log('files=>',req?.files);
  
  const result = await ProductServices.createProduct(req.body?.productValues, req?.files);

  // Below you can see the use of custom sendResponse function to make the code base clean. 
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Product created succesfully',
    data: result,
  });
})

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const {result, totalProducts} = await ProductServices.getAllProducts(req.query);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Products retrieved successfully",
    totalProducts: totalProducts,
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
  console.log(req?.body, req?.query, req?.files, );
  // const data = JSON.parse(req.body.updatedValues)

  // Pass the productId from query and req.body and also pass the req object (or req.files) for file handling
  const result = await ProductServices.updateAProduct(req?.query?.productId as string, req?.body?.updatedValues, req?.files);

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