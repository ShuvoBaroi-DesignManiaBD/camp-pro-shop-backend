import { Schema, model, Document } from "mongoose";
import { IProduct, IProductImage } from "./product.interface";

const productImageSchema = new Schema<IProductImage>(
  {
    // url: { type: String, required: [true, "URL is required"] },
    url: { type: String },
    alt: { type: String },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: [true, "Name is required"], unique: true },
    price: { type: Number, required: [true, "Price is required"] },
    stockQuantity: {
      type: Number,
      required: [true, "Stock Quantity is required"],
    },
    description: { type: String, required: [true, "Description is required"] },
    category: { type: String, required: [true, "Category is required"] },
    ratings: { type: Number, required: [true, "Ratings are required"] },
    images: {
      type: [productImageSchema],
      required: [true, "Images are required"],
    },
    isStock: { type: Boolean, required: [true, "Stock status is required"] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = model<IProduct>("Product", productSchema);

export default Product;
