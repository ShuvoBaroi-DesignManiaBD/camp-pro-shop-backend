import { Document } from "mongoose";

export interface IProductImage {
  url?: string;
  alt?: string;
}

export interface IProduct extends Document {
  name: string;
  price: number;
  stockQuantity: number;
  description: string;
  category: string;
  ratings: number;
  images: IProductImage[] | undefined;
  isStock: boolean;
  isDeleted: boolean;
}

// Create an array of IProduct keys
export const IProductKeys: string[] = [
  "name",
  "price",
  "stockQuantity",
  "description",
  "category",
  "ratings",
  "images",
  "isStock",
  "isDeleted",
];
