import { z } from "zod";

// Define the ProductImage schema
const productImageSchema = z.object({
  // url: z.string().min(1, "URL is required"),
  url: z.string().optional(),
  alt: z.string().optional(),
});

// Define the Product schema
const productValidationSchema = z.object({
  body: z
    .object({
      productValues: z.object({
        name: z.string().min(1, "Name is required"),
        price: z
          .number()
          .min(0, "Price must be a positive number")
          .nonnegative("Price is required"),
        stockQuantity: z
          .number()
          .int()
          .nonnegative("Stock Quantity must be a non-negative integer"),
        description: z.string().min(1, "Description is required"),
        category: z.string().min(1, "Category is required"),
        ratings: z
          .number()
          .min(0, "Ratings must be a positive number")
          .max(5, "Ratings must be 5 or less"),
        // images: z.array(productImageSchema).min(1, "Images are required"),
        isStock: z.boolean().default(true),
        isDeleted: z.boolean().default(false),
      }),
    })
    .refine((data) => {
      // Set isStock to false if stockQuantity is 0
      if (data.productValues?.stockQuantity === 0) {
        data.productValues.isStock = false;
      }
      return true;
    }),
});

// Define Zod schema for IProduct
const productUpdateSchema = z.object({
  body: z.object({
    updatedValues: z.object({
      name: z.string().optional(), // All fields are optional for update
      price: z.number().positive().optional(),
      stockQuantity: z.number().min(0).optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      ratings: z.number().min(0).optional(),
      images: z.array(productImageSchema).optional(), // Assuming images can be updated as an array
      isStock: z.boolean().optional(),
      isDeleted: z.boolean().optional(),
    }),
  }),
});

export const ProductValidation = {
  productImageSchema,
  productValidationSchema,
  productUpdateSchema,
};
