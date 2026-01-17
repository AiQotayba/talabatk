import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import path from 'path';

interface UploadedFileInfo {
    url: string;
    path: string;
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
}

/**
 * Controller for uploading single image
 */
export const uploadSingleImageController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            sendError(res, 'لم يتم رفع أي صورة. يرجى اختيار صورة', 400);
            return;
        }

        // Get folder from params, query, or body
        const folder = (req.params?.folder || req.query?.folder || req.body?.folder || 'general') as string;
        const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
        
        // Get base URL from environment or construct from request
        const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
        const filePath = `/storage/${sanitizedFolder}/${req.file.filename}`;

        const fileInfo: UploadedFileInfo = {
            url: baseUrl + filePath,
            path: filePath,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        };

        sendSuccess(res, fileInfo, 'تم رفع الصورة بنجاح');
    } catch (error) {
        console.error('Upload single image error:', error);
        sendError(res, 'حدث خطأ أثناء رفع الصورة. يرجى التأكد من صحة الصورة والمحاولة مرة أخرى', 500);
    }
};

/**
 * Controller for uploading multiple images
 */
export const uploadMultipleImagesController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        
        if (!files || files.length === 0) {
            sendError(res, 'لم يتم رفع أي صور. يرجى اختيار صورة واحدة على الأقل', 400);
            return;
        }

        // Get folder from params, query, or body
        const folder = (req.params?.folder || req.query?.folder || req.body?.folder || 'general') as string;
        const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
        
        // Get base URL from environment or construct from request
        const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;

        // Process all uploaded files
        const uploadedFiles: UploadedFileInfo[] = files.map(file => {
            const filePath = `/storage/${sanitizedFolder}/${file.filename}`;
            return {
                url: baseUrl + filePath,
                path: filePath,
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype
            };
        });

        sendSuccess(res, {
            files: uploadedFiles,
            count: uploadedFiles.length,
            folder: sanitizedFolder
        }, `تم رفع ${uploadedFiles.length} صورة بنجاح`);
    } catch (error) {
        console.error('Upload multiple images error:', error);
        sendError(res, 'حدث خطأ أثناء رفع الصور. يرجى التأكد من صحة الصور والمحاولة مرة أخرى', 500);
    }
};

/**
 * Flexible upload controller - handles both single and multiple files
 * Works with uploadFiles middleware which uses 'files' fieldname
 */
export const uploadFilesController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        
        if (!files || files.length === 0) {
            sendError(res, 'لم يتم رفع أي ملفات. يرجى اختيار ملف واحد على الأقل', 400);
            return;
        }

        // Get folder from params, query, or body
        const folder = (req.params?.folder || req.query?.folder || req.body?.folder || 'general') as string;
        const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
        
        // Get base URL from environment or construct from request
        const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;

        // Process all uploaded files
        const uploadedFiles: UploadedFileInfo[] = files.map(file => {
            const filePath = `/storage/${sanitizedFolder}/${file.filename}`;
            return {
                url: baseUrl + filePath,
                path: filePath,
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype
            };
        });

        // Return single file object if only one file, array if multiple
        if (uploadedFiles.length === 1) {
            sendSuccess(res, uploadedFiles[0], 'تم رفع الملف بنجاح');
        } else {
            sendSuccess(res, {
                files: uploadedFiles,
                count: uploadedFiles.length,
                folder: sanitizedFolder
            }, `تم رفع ${uploadedFiles.length} ملف بنجاح`);
        }
    } catch (error) {
        console.error('Upload files error:', error);
        sendError(res, 'حدث خطأ أثناء رفع الملفات. يرجى التأكد من صحة الملفات والمحاولة مرة أخرى', 500);
    }
};

/**
 * Legacy controller for backward compatibility
 * @deprecated Use uploadSingleImageController or uploadMultipleImagesController instead
 */
export const imgesController = uploadSingleImageController;
