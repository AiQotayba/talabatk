import multer from 'multer';
import path from 'path';
import { appConfig } from '../config/app';
import { Request } from 'express';
import fs from 'fs';

// Resolve absolute path for uploads directory
const resolveUploadPath = () => {
  const uploadPath = appConfig.uploadPath;
  // If relative path, resolve from project root
  if (uploadPath.startsWith('./') || !path.isAbsolute(uploadPath)) {
    return path.resolve(process.cwd(), uploadPath);
  }
  return uploadPath;
};

const absoluteUploadPath = resolveUploadPath();

// Create uploads directory if it doesn't exist
if (!fs.existsSync(absoluteUploadPath)) {
  fs.mkdirSync(absoluteUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    let uploadDir = absoluteUploadPath;
    
    // Organize files by type
    if (file.fieldname === 'profile_photo') {
      uploadDir = path.join(uploadDir, 'profiles');
    } else if (file.fieldname === 'proof_photos') {
      uploadDir = path.join(uploadDir, 'proofs');
    } else if (file.fieldname === 'complaint_photos') {
      uploadDir = path.join(uploadDir, 'complaints');
    } else if (file.fieldname === 'message_images') {
      uploadDir = path.join(uploadDir, 'complaints');
    } else if (file.fieldname === 'images') {
      uploadDir = path.join(uploadDir, 'messages');
    } else {
      uploadDir = path.join(uploadDir, 'general');
    }
    console.log(uploadDir);

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
    'image/webp', // Add webp support
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac'
  ];

  // Also check file extension as fallback
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp3', '.wav', '.ogg', '.aac'];
  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`));
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

// Enhanced error handling for array uploads
const handleUploadError = (err: any, res: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${appConfig.maxFileSize / 1024 / 1024}MB`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files per request',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
      });
    }
  }

  return res.status(400).json({
    success: false,
    message: err.message || 'Failed to upload file',
  });
};

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
    next();
  });
};

// Profile photo upload middleware with error handling
export const uploadImages = (req: any, res: any, next: any) => {
  
  upload.single('images')(req, res, (err: any) => {
    if (err) {
      console.error('Upload middleware error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload file',
      });
    }
    next();
  });
};

// Proof photos upload with error handling
export const uploadProofPhotos = (req: any, res: any, next: any) => {
  upload.array('proof_photos', 5)(req, res, (err: any) => {
    if (err) {
      return handleUploadError(err, res);
    }
    next();
  });
};

// Complaint photos upload with error handling
export const uploadComplaintPhotos = (req: any, res: any, next: any) => {
  upload.array('complaint_photos', 5)(req, res, (err: any) => {
    if (err) {
      return handleUploadError(err, res);
    }
    next();
  });
};

// Message images upload with error handling
export const uploadMessageImages = (req: any, res: any, next: any) => {
  upload.array('message_images', 5)(req, res, (err: any) => {
    if (err) {
      return handleUploadError(err, res);
    }
    next();
  });
};

// Flexible file upload middleware - supports multiple files with configurable max count
export const uploadFiles = (maxFiles: number = 20) => {
  return (req: any, res: any, next: any) => {
    upload.array('files', maxFiles)(req, res, (err: any) => {
      if (err) {
        return handleUploadError(err, res);
      }
      next();
    });
  };
};
