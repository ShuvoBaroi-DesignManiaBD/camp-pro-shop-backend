/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ProductValidation } from './product.validation';
import { ProductControllers } from './product.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.post(
  '/create-product',
  auth(USER_ROLE.admin),
  validateRequest(ProductValidation.productValidationSchema), 
  ProductControllers.createProduct, 
);

router.get(
  '', 
  ProductControllers.getAllProducts, 
);


export const productRoutes = router;