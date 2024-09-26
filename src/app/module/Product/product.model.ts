import { Schema, model, Document, Model } from "mongoose";
import { IProduct, IProductImage } from "./product.interface";

// Define the product image schema
const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
  },
  { _id: false }
);

// Define the product schema
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
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

// Pre-save hook to validate uniqueness of the product name
productSchema.pre<IProduct>("save", async function (next) {
  const product = this; // 'this' refers to the current product document

  // Check if the name is modified or the document is new
  if (product.isNew || product.isModified("name")) {
    const existingProduct = await Product.findOne({
      name: product.name,
      isDeleted: false,
    });
    
    if (existingProduct) {
      // If a product with the same name exists, throw an error
      const error = new Error("A product with this name already exists.");
      return next(error);
    }
  }

  // Continue with saving if validation passes
  next();
});

// Create a Product model with the IProduct interface
const Product = model<IProduct>("Product", productSchema);

// Export the Product model
export default Product;
