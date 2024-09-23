/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { IProduct, IProductKeys } from "./product.interface";
import Product from "./product.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import DataNotFoundError from "../../errors/DataNotFoundError";
import { ProductSearchableFields } from "./product.constant";
import { cartItem } from "../Order/order.interface";
import { upload } from "../../utils/uploadImageToServer";
import { IProductImage } from "./product.interface";
import config from "../../config";

const createProduct = async (payload: IProduct) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const isProductExist = await Product.find({ name: payload?.name });

    if (isProductExist.length !== 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "A product with this name already exist!"
      );
    }
    const result = await Product.create(payload);
    await session.commitTransaction();
    await session.endSession();
    return (result as any)?._doc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

const getAProduct = async (id: string) => {
  const product = await Product.findById(id);

  if (!product || product.isDeleted) {
    throw new DataNotFoundError();
  }

  return product;
};

const getAllProducts = async (query: Record<string, unknown>) => {
  const baseQuery = new QueryBuilder(Product.find({ isDeleted: false }), query)
    .search(ProductSearchableFields)
    .filter()
    .sort()
    .fields();

  // Clone the query for counting documents
  const countQuery = baseQuery.modelQuery.clone();

  // Count the total number of documents matching the criteria
  const totalMatchingDocuments = await countQuery.countDocuments().exec();

  // Apply pagination to the original query
  baseQuery.paginate();

  // Get the final result with pagination
  const result = await baseQuery.modelQuery.exec();

  return { result, totalProducts: totalMatchingDocuments };
};

// ======================= Update operations =======================
// const updateAProduct = async (
//   id: string,
//   payload: {updatedValues: Partial<IProduct>, removedImages: string[]},
//   images: File[] & any
// ) => {
//   console.log(images, payload);
//   const updatedValues = payload?.updatedValues;
//   const removedImages = payload?.removedImages;
//   // Find the product by ID
//   const product = await Product.findById(id);

//   if (!product) {
//     throw new DataNotFoundError();
//   }

//   // Check for invalid fields in the payload
//   for (const key of Object.keys(updatedValues)) {
//     if (!IProductKeys.includes(key)) {
//       throw new AppError(httpStatus.BAD_REQUEST, `Invalid field: ${key}`);
//     }
//   }

// let uploadedImages = [];

// // Append uploaded images to the payload
// let oldImages = (product.images &&  product.images.length > 0) ? [...product.images] : [];
// console.log("old_images=>", oldImages);
//   // Handle file upload using req.files (assuming multer middleware is used)
//   if (images && images.length > 0) {
//     uploadedImages = images.map((file: File & any) => ({
//       url: `${config.backend_url}uploads/public/products/${product?.name.toLowerCase().replace(/ /g, "_")}/${file?.filename}`, // Assuming you're saving images in an 'uploads' directory
//       alt: file.originalname, // Optionally save the original name
//     }));


//     if(uploadedImages.length > 0) {
//       for (const item of uploadedImages) {
//         if (!oldImages.some((img) => img.alt === item.alt)) {
//           if (oldImages.length < 5) {
//             oldImages.push(item);
//           }
//         }
//       }

//     }

//   }

//   if (oldImages.length > 0) {
//     let imagesAfterDelete;
//     if(removedImages !== undefined){
//       for (const item of oldImages) {
//         if (removedImages.some((img) => img === item.url)) {
//           imagesAfterDelete = oldImages.filter(i=>i!== item);
//         }
//       }
//       oldImages = imagesAfterDelete
//     }
//     updatedValues.images = oldImages;
//     console.log('images have added in PAYLOAD=>',updatedValues.images, oldImages, uploadedImages);
//   }
//   // Perform the update
//   const result = await Product.findByIdAndUpdate(id, payload, {
//     new: true,
//     runValidators: true,
//   });

//   if (!result) {
//     throw new AppError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       "Failed to update the product!"
//     );
//   }

//   return result;
// };

const updateAProduct = async (
  id: string,
  payload: { updatedValues: Partial<IProduct>; removedImages?: string[] },
  images: File[] & any
) => {
  console.log(images, payload);
  
  const updatedValues = payload?.updatedValues || {};
  const removedImages = payload?.removedImages || [];
  
  // Find the product by ID
  const product = await Product.findById(id);
  
  if (!product) {
    throw new DataNotFoundError();
  }

  // Check for invalid fields in the payload
  for (const key of Object.keys(updatedValues)) {
    if (!IProductKeys.includes(key)) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid field: ${key}`);
    }
  }

  let uploadedImages = [];
  
  // Copy old images from the product (if any)
  let oldImages = (product.images && product.images.length > 0) ? [...product.images] : [];
  console.log("old_images =>", oldImages);

  // Handle new image uploads
  if (images && images.length > 0) {
    uploadedImages = images.map((file: File & any) => ({
      url: `${config.backend_url}uploads/public/products/${product?.name.toLowerCase().replace(/ /g, "_")}/${file?.filename}`,
      alt: file.originalname, // Optionally save the original name
    }));

    // Append unique uploaded images to the oldImages array
    uploadedImages.forEach((item:any) => {
      if (!oldImages.some((img) => img.alt === item.alt) && oldImages.length < 5) {
        oldImages.push(item); // Ensure only up to 5 images are kept
      }
    });
  }

  // Handle image removal based on removedImages array
  if (removedImages !== undefined && removedImages.length > 0) {
    oldImages = oldImages.filter((img) => !removedImages.includes(img.url as string));
    console.log(oldImages);
    
  }

  // Update the images in the updatedValues payload
  updatedValues.images = oldImages;
  console.log('Images added to PAYLOAD =>', updatedValues.images);

  // Perform the update
  const result = await Product.findByIdAndUpdate(id, updatedValues, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update the product!");
  }

  return result;
};


const updateProductsStock = async (products: cartItem[]) => {
  // Start a session and transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Iterate over each product
    for (const product of products) {
      console.log("Processing product: ", product);

      // Convert product.id to ObjectId
      const productId = new mongoose.Types.ObjectId(product.id);

      // Find the product using session
      const foundProduct = await Product.findById(productId).session(session);
      console.log("Found Product:", foundProduct);

      if (!foundProduct) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          `Product with ID ${product.id} not found!`
        );
      }

      const newStockQuantity = foundProduct.stockQuantity - product.quantity;

      // Ensure stock quantity does not go below zero
      if (newStockQuantity < 0) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Insufficient stock for product with ID ${product.id}!`
        );
      }

      // Update stock quantity using session
      await Product.findByIdAndUpdate(
        productId,
        { stockQuantity: newStockQuantity },
        { new: true, session }
      );
    }

    // Commit the transaction after all operations
    await session.commitTransaction();
    console.log("Transaction committed successfully.");
  } catch (err) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    console.error("Transaction aborted due to an error:", err);
    throw err; // Re-throw the error after aborting the transaction
  } finally {
    // End the session
    session.endSession();
  }
};

// ======================= Update operations =======================

const deleteAProduct = async (id: string) => {
  const result = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to delete the product");
  }
  return result;
};

export const ProductServices = {
  createProduct,
  getAllProducts,
  getAProduct,
  updateAProduct,
  deleteAProduct,
  updateProductsStock,
};
