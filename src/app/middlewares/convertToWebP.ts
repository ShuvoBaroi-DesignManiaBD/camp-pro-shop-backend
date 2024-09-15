import sharp from 'sharp';
import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import path from 'path';

// Middleware for image conversion to WebP
export const convertToWebP = async (req: Request, res: Response, next: NextFunction) => {
  console.log('file=>', req?.file);

  if (!req.file) {
    return next(new Error('No file uploaded.'));
  }

  const filePath = req.file.path;
  console.log('filepath=>', filePath);

  const newFilePath = filePath.replace(/\.[^/.]+$/, '.webp');

  try {
    // Convert the uploaded image to WebP
    await sharp(filePath)
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toFile(newFilePath);

    // Replace original file with the WebP file in req.file
    req.file.path = newFilePath;
    req.file.filename = path.basename(newFilePath);
    req.file.mimetype = 'image/webp';

    // Optionally delete the original image file after conversion
    const normalizedFilePath = path.normalize(filePath); // Normalize the path
    fs.unlink(normalizedFilePath, (err) => {
      if (err) {
        console.error(`Failed to delete original file: ${err}`);
      } else {
        console.log(`Original file ${normalizedFilePath} deleted successfully.`);
      }
    });

    next();
  } catch (error) {
    console.error('Error converting image to WebP:', error);
    next(error);
  }
};


