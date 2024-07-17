import { Document } from 'mongoose';

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface IProduct extends Document {
  name: string;
  price: number;
  stockQuantity: number;
  description: string;
  category: string;
  ratings: number;
  images: ProductImage[];
  isStock: boolean;
  isDeleted: boolean;
}
