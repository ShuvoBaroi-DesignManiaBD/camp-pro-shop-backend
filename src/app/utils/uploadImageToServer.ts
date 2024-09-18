import fs from 'fs';
import path from 'path';
import multer, { StorageEngine, FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import config from '../config';
import { User } from '../module/User/user.model';
import { Error } from 'mongoose';
import { convertToWebP } from '../middlewares/convertToWebP';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

// Base upload directories
const usersUploadDir: string = path.join(process.cwd(), '../uploads/users/');
const publicUploadDir: string = path.join(process.cwd(), '../uploads/public/');
const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);

// Ensure the directories exist
if (!fs.existsSync(usersUploadDir)) {
  fs.mkdirSync(usersUploadDir, { recursive: true });
}
if (!fs.existsSync(publicUploadDir)) {
  fs.mkdirSync(publicUploadDir, { recursive: true });
}

// File filter function for image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Custom storage engine for multer
const storage: StorageEngine = multer.diskStorage({
  destination: async (req: Request, file: Express.Multer.File, cb) => {
    console.log(usersUploadDir);
    try {
      const { userId, type } = req.query;
      const isProfileUpload = type === 'profile';
      const baseDirectory = isProfileUpload ? usersUploadDir : publicUploadDir;
      // const convertToWebp = await convertToWebP(req?.file);
      const imageName = uniquePrefix + '-' + file.originalname;
      // console.log('webP=>',convertToWebp);
      console.log('type=>', type);
      
      const user = userId ? await User.findById(userId) : null;
      if(!user) new AppError(httpStatus.FORBIDDEN, "Unauthorized access!");
      const directory = (isProfileUpload && user) ? path.join(baseDirectory, user?.name?.toLowerCase().replace(/ /g, "_")) : baseDirectory;

      // Ensure the directory exists
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      console.log(directory);

      cb(null, directory); // Use the determined directory
    } catch (error:any) {
      cb(error, '');
    }
  },
  filename: async (req: Request, file: Express.Multer.File, cb) => {
    console.log('fileName', req?.file);
    
    const imageName = uniquePrefix + '-' + file.originalname;
    const webp = imageName.replace(/\.[^/.]+$/, ".webp");
                
    const { userId, type } = req.query;
    User.findById(userId).then(user => {
      const subDirectory = type === 'profile' ? `users/${user?.name?.toLowerCase().replace(/ /g, "_")}` : 'public';

      // Store the path to the uploaded image in req.body.profileImage for later use
      req.body.profileImage = path.join(config.backend_url as string, 'uploads', subDirectory, webp);
      cb(null, imageName);
    }).catch(err => cb(err, ''));
  }
});

// Multer middleware
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
})

