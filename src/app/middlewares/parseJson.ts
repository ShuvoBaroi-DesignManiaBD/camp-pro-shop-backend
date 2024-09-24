import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import httpStatus from "http-status";

// Middleware for image conversion to WebP
export const parseJson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req?.body, req?.query);

  try {
    // Only parse if updatedValues is a string, otherwise it's already an object
    console.log(typeof req.body.updatedValues);
    const productValues = typeof req.body.productValues === 'string'
      ? JSON.parse(req.body.productValues)
      : req.body.productValues;
    const updatedData = typeof req.body.updatedValues === 'string'
      ? JSON.parse(req.body.updatedValues)
      : req.body.updatedValues;
    const removedImages = typeof req.body.removedImages === 'string'
    ? JSON.parse(req.body.removedImages)
    : req.body.removedImages;
    // updatedData.images = req.files; // Attach uploaded files
    console.log('Updated Values =>', req?.body.updatedValues, updatedData, 'removed Images=>', removedImages, 'productValues=>', productValues);
    req.body.updatedValues = updatedData;
    req.body.removedImages = removedImages;
    req.body.productValues = productValues;

    next(); // Proceed to the next middleware
  } catch (error) {
    throw new AppError(httpStatus.NOT_FOUND, `${error}`);
  }
};
