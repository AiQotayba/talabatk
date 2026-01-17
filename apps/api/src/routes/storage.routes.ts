import { Router } from 'express';
import { uploadFiles } from '../middleware/upload.middleware';
import { uploadFilesController } from '../controllers/storage.controller';

const router: Router = Router();

// All routes require authentication
// router.use(authenticateToken as any);

/**
 * @route POST /api/storage/upload
 * @desc Flexible upload endpoint - supports single or multiple files
 * @access Public (or add authentication middleware)
 * @body {string} folder - Folder name (required)
 * @body {File|File[]} files - Single file or array of files (field name: 'files')
 * 
 * @example
 * // Single file
 * POST /api/storage/upload
 * Body: form-data
 *   - folder: "products"
 *   - files: [file]
 * 
 * @example
 * // Multiple files
 * POST /api/storage/upload
 * Body: form-data
 *   - folder: "products"
 *   - files: [file1, file2, file3]
 */
router.post('/upload', uploadFiles(20) as any, uploadFilesController);

export default router;
