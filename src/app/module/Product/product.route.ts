/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ProductValidation } from './product.validation';
import { ProductControllers } from './product.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { upload } from '../../utils/uploadImageToServer';
import { convertToWebP } from '../../middlewares/convertToWebP';
import { parseJson } from '../../middlewares/parseJson';

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

router.get(
  '/:id', 
  ProductControllers.getAProduct, 
);

router.patch(
  '/update-product',
  auth(USER_ROLE.admin),
  upload.array('images', 5), // Use multer to handle image uploads (limit to 5 files)
  parseJson,
  validateRequest(ProductValidation.productUpdateSchema),
  convertToWebP, 
  ProductControllers.updateAProduct
);

// router.patch(
//   '/:id',
//   auth(USER_ROLE.admin),
//   validateRequest(ProductValidation.productUpdateSchema), 
//   ProductControllers.updateAProduct, 
// );

// router.patch(
//   "/upload-file",
//   auth(USER_ROLE?.admin),
//   upload.array('file', 5),
//   convertToWebP,
//   UserControllers.updateProfilePhoto
// );

router.delete(
  '/:id',
  auth('admin'),
  ProductControllers.deleteAProduct,
);

export const productRoutes = router;