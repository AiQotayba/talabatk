import multer from 'multer';
import path from 'path';
import { appConfig } from '../config/app';
import { Request } from 'express';

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync(appConfig.uploadPath)) {
  fs.mkdirSync(appConfig.uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    let uploadDir = appConfig.uploadPath;
    
    // Organize files by type
    if (file.fieldname === 'profile_photo') {
      uploadDir = path.join(uploadDir, 'profiles');
    } else if (file.fieldname === 'proof_photos') {
      uploadDir = path.join(uploadDir, 'proofs');
    } else if (file.fieldname === 'complaint_photos') {
      uploadDir = path.join(uploadDir, 'complaints');
    } else {
      uploadDir = path.join(uploadDir, 'general');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req: Request, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images and audio files
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and audio files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: appConfig.maxFileSize,
    files: 5 // Maximum 5 files per request
  }
});

export const uploadProfilePhoto = upload.single('profile_photo') as any;
export const uploadProofPhotos = upload.array('proof_photos', 5) as any;
export const uploadComplaintPhotos = upload.array('complaint_photos', 5) as any;
