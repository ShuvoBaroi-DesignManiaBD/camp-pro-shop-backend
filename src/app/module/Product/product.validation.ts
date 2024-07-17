import { z } from 'zod';

// Define the ProductImage schema
const productImageSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  alt: z.string().optional(),
});

// Define the Product schema
const productValidationSchema = z.object({
  body: z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be a positive number').nonnegative('Price is required'),
  stockQuantity: z.number().int().nonnegative('Stock Quantity must be a non-negative integer'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  ratings: z.number().min(0, 'Ratings must be a positive number').max(5, 'Ratings must be 5 or less'),
  images: z.array(productImageSchema).min(1, 'Images are required'),
  isStock: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
}).refine(data => {
  // Set isStock to false if stockQuantity is 0
  if (data.stockQuantity === 0) {
    data.isStock = false;
  }
  return true;
})
})

export const ProductValidation = {
  productImageSchema,
  productValidationSchema
}
