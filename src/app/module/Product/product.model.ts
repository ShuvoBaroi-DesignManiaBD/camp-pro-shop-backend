import { Schema, model, Document, Model } from "mongoose";
import { IProduct, IProductImage } from "./product.interface";

// Define the product image schema
const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String },
    alt: { type: String },
  },
  { _id: false }
);

// Define the product schema
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      validate: {
        validator: async function (value: string) {
          // Specify the type of 'this' to use the Product model correctly
          const Model = this.constructor as Model<IProduct>;
          const existingProduct = await Model.findOne({
            name: value,
            isDeleted: false,
          });
          return !existingProduct;
        },
        message: "A product with this name already exists.",
      },
    },
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

// Create a Product model
const Product = model<IProduct>("Product", productSchema);

// Export the Product model
export default Product;
