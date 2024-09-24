import fs from 'fs';
import path from 'path';
import multer, { StorageEngine, FileFilterCallback } from 'multer';
import { NextFunction, Request } from 'express';
import config from '../config';
import { User } from '../module/User/user.model';
import { convertToWebP } from '../middlewares/convertToWebP';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import Product from '../module/Product/product.model';

// Base upload directories
const usersUploadDir: string = path.join(process.cwd(), '../uploads/users/');
const publicUploadDir: string = path.join(process.cwd(), '../uploads/public/');
const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);

// Ensure the directories exist
const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDirectoryExists(usersUploadDir);
ensureDirectoryExists(publicUploadDir);

// File filter function for image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  console.log('file=>',file, 'body=>',req.body);
  
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extname) {
    cb(null, true);
  } else {
    cb(new AppError(httpStatus.BAD_REQUEST, 'Only image files (jpeg, jpg, png, gif) are allowed!'));
  }
};

// Custom storage engine for multer
const storage: StorageEngine = multer.diskStorage({
  destination: async (req: Request, file: Express.Multer.File, cb) => {
    console.log('file=>',file, 'body=>',req.body);
    try {
      const { userId, type, productId } = req.query;
      const isProfileUpload = type === 'profile';
      const isProductUpload = type === 'product';

      // Determine base directory based on the type
      let baseDirectory = isProfileUpload ? usersUploadDir : publicUploadDir;

      // Fetch the user for profile uploads
      const user = isProfileUpload && userId ? await User.findById(userId) : null;
      const product = isProductUpload && productId ? await Product.findById(productId) : null;
      if (isProfileUpload && !user) {
        return cb(new AppError(httpStatus.FORBIDDEN, 'Unauthorized access!'), '');
      }

      // Construct directory path
      let directory = '';
      if (isProfileUpload) {
        directory = path.join(baseDirectory, user?.name?.toLowerCase().replace(/ /g, '_') || '');
      } else if (isProductUpload){
        directory = path.join(baseDirectory, 'products', product?.name?.toLowerCase().replace(/ /g, '_') || '');
      }
      
      ensureDirectoryExists(directory);
      cb(null, directory);
    } catch (error: any) {
      cb(new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Failed to upload'), '');
    }
  },
  filename: async (req: Request, file: Express.Multer.File, cb) => {
    console.log('file=>',file);
    
    try {
      const { userId, type } = req.query;
      console.log(type);
      
      // Generate unique filename
      const imageName = uniquePrefix + '-' + file.originalname;
      const webpName = imageName.replace(/\.[^/.]+$/, '.webp'); // Convert filename to .webp

      // Fetch the user to set profile image path in req.body
      if (type === 'profile' && userId) {
        const user = await User.findById(userId);
        if (user) {
          const subDirectory = `users/${user?.name?.toLowerCase().replace(/ /g, '_')}`;
          req.body.profileImage = path.join(config.backend_url as string, 'uploads', subDirectory, webpName);
        }
      }

      cb(null, imageName);
    } catch (error: any) {
      cb(new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Error in file upload'), '');
    }
  },
});

// Multer middleware
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
});







// import fs from 'fs';
// import path from 'path';
// import multer, { StorageEngine, FileFilterCallback } from 'multer';
// import { Request, Response, NextFunction } from 'express';
// import config from '../config';
// import { User } from '../module/User/user.model';
// import { Error } from 'mongoose';
// import { convertToWebP } from '../middlewares/convertToWebP';
// import AppError from '../errors/AppError';
// import httpStatus from 'http-status';

// // Base upload directories
// const usersUploadDir: string = path.join(process.cwd(), '../uploads/users/');
// const publicUploadDir: string = path.join(process.cwd(), '../uploads/public/');
// const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);

// // Ensure the directories exist
// if (!fs.existsSync(usersUploadDir)) {
//   fs.mkdirSync(usersUploadDir, { recursive: true });
// }
// if (!fs.existsSync(publicUploadDir)) {
//   fs.mkdirSync(publicUploadDir, { recursive: true });
// }

// // File filter function for image files
// const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//   const allowedTypes = /jpeg|jpg|png|gif/;
//   const mimeType = allowedTypes.test(file.mimetype);
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

//   if (mimeType && extname) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed!'));
//   }
// };

// // Custom storage engine for multer
// const storage: StorageEngine = multer.diskStorage({
//   destination: async (req: Request, file: Express.Multer.File, cb) => {
//     console.log(usersUploadDir);
//     try {
//       const { userId, type, productId } = req.query;
//       const isProfileUpload = type === 'profile';
//       const isProductImg = type === 'product';
//       let baseDirectory = isProfileUpload ? usersUploadDir : publicUploadDir;
//       baseDirectory = path.join(baseDirectory, file?.originalname)
//       // const convertToWebp = await convertToWebP(req?.file);
//       const imageName = uniquePrefix + '-' + file.originalname;
//       // console.log('webP=>',convertToWebp);
//       console.log('type=>', type);
      
//       const user = (userId && !productId) ? await User.findById(userId) : null;
//       if(isProfileUpload && !user) new AppError(httpStatus.FORBIDDEN, "Unauthorized access!");
//       const directory = (isProfileUpload && user) ? path.join(baseDirectory, user?.name?.toLowerCase().replace(/ /g, "_")) : baseDirectory;

//       // Ensure the directory exists
//       if (!fs.existsSync(directory)) {
//         fs.mkdirSync(directory, { recursive: true });
//       }

//       console.log(directory);

//       cb(null, directory); // Use the determined directory
//     } catch (error:any) {
//       cb(error, '');
//     }
//   },
//   filename: async (req: Request, file: Express.Multer.File, cb) => {
//     console.log('fileName', req?.file);
    
//     const imageName = uniquePrefix + '-' + file.originalname;
//     const webp = imageName.replace(/\.[^/.]+$/, ".webp");
                
//     const { userId, type } = req.query;
//     User.findById(userId).then(user => {
//       const subDirectory = type === 'profile' ? `users/${user?.name?.toLowerCase().replace(/ /g, "_")}` : 'public';

//       // Store the path to the uploaded image in req.body.profileImage for later use
//       (type === "profile") && (req.body.profileImage = path.join(config.backend_url as string, 'uploads', subDirectory, webp));
//       cb(null, imageName);
//     }).catch(err => cb(err, ''));
//   }
// });

// // Multer middleware
// export const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
// })

