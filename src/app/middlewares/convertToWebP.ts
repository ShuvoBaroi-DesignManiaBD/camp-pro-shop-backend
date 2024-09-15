import sharp from "sharp";
import fs from "fs/promises"; // Use fs.promises for async operations
import { NextFunction, Request, Response } from "express";
import path from "path";

// Middleware for image conversion to WebP
export const convertToWebP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("file=>", req?.file);

  if (!req?.file) {
    return next(new Error("No file uploaded."));
  }

  const filePath = req.file.path;
  const newFilePath = filePath.replace(/\.[^/.]+$/, ".webp");

  try {
    // Convert the uploaded image to WebP
    await sharp(filePath)
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toFile(newFilePath);  // Save the converted file to the new path

    console.log("WebP image saved at:", newFilePath);

    // Update req.file to reference the new WebP file
    req.file.path = newFilePath;
    req.file.filename = path.basename(newFilePath);
    req.file.mimetype = "image/webp";

    // Optional: Check if the WebP file exists after conversion
    try {
      await fs.access(newFilePath);
      console.log("WebP file exists:", newFilePath);
    } catch (err) {
      console.error("Error: WebP file not found:", newFilePath);
      return next(new Error("Failed to create WebP file."));
    }

    // Delete the original file (JPEG/PNG)
    await fs.unlink(filePath);
    console.log(`Original file ${filePath} deleted successfully.`);

    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("Error converting image to WebP:", error);
    next(error);
  }
};
