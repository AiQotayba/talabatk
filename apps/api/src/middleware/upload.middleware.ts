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
    } else if (file.fieldname === 'message_images') {
      uploadDir = path.join(uploadDir, 'messages');
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

// Profile photo upload middleware with error handling
export const uploadProfilePhoto = (req: any, res: any, next: any) => {
  upload.single('profile_photo')(req, res, (err: any) => {
    if (err) {
      console.error('Upload middleware error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload file',
      });
    }
    
    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Upload middleware - File received:', {
        file: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        } : null,
        body: req.body,
      });
    }
    
    next();
  });
};
export const uploadProofPhotos = upload.array('proof_photos', 5) as any;
export const uploadComplaintPhotos = upload.array('complaint_photos', 5) as any;
export const uploadMessageImages = upload.array('message_images', 5) as any;
