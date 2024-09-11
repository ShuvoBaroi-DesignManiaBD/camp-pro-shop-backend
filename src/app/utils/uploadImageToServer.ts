import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the created directory
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const imageName = uniquePrefix + '-' + file.originalname;
    cb(null, imageName);
    req.profileImage = path.join(process.cwd(), 'uploads', imageName);
  },
});

export const upload = multer({ storage: storage });
