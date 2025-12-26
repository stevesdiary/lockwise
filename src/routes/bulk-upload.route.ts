import { Router } from 'express';
import bulkUploadController from '../controllers/bulk-upload.controller';
import fileUploadService from '../services/file-upload.service';

const bulkUploadRouter = Router();

/**
 * @swagger
 * /api/v1/bulk-upload/estates:
 *   post:
 *     summary: Bulk upload estates from Excel/CSV file
 *     tags: [Bulk Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel (.xlsx, .xls) or CSV file with estate data
 *     responses:
 *       200:
 *         description: Bulk upload completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalProcessed:
 *                       type: integer
 *                     successCount:
 *                       type: integer
 *                     errorCount:
 *                       type: integer
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid file or validation error
 *       500:
 *         description: Internal server error
 */
bulkUploadRouter.post('/estates', 
  fileUploadService.uploader.single('file'), 
  bulkUploadController.uploadEstates
);

/**
 * @swagger
 * /api/v1/bulk-upload/residents:
 *   post:
 *     summary: Bulk upload residents from Excel/CSV file
 *     tags: [Bulk Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel (.xlsx, .xls) or CSV file with resident data
 *     responses:
 *       200:
 *         description: Bulk upload completed
 *       400:
 *         description: Invalid file or validation error
 *       500:
 *         description: Internal server error
 */
bulkUploadRouter.post('/residents', 
  fileUploadService.uploader.single('file'), 
  bulkUploadController.uploadResidents
);

/**
 * @swagger
 * /api/v1/bulk-upload/addresses:
 *   post:
 *     summary: Bulk upload addresses for an estate from Excel/CSV file
 *     tags: [Bulk Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - estateId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel (.xlsx, .xls) or CSV file with address data
 *               estateId:
 *                 type: string
 *                 description: Estate ID to associate addresses with
 *     responses:
 *       200:
 *         description: Bulk upload completed
 *       400:
 *         description: Invalid file, missing estate ID, or validation error
 *       500:
 *         description: Internal server error
 */
bulkUploadRouter.post('/addresses', 
  fileUploadService.uploader.single('file'), 
  bulkUploadController.uploadAddresses
);

/**
 * @swagger
 * /api/v1/bulk-upload/template/{type}:
 *   get:
 *     summary: Get upload template format and sample data
 *     tags: [Bulk Upload]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [estates, residents, addresses]
 *         description: Template type
 *     responses:
 *       200:
 *         description: Template information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     headers:
 *                       type: array
 *                       items:
 *                         type: string
 *                     sampleData:
 *                       type: array
 *                       items:
 *                         type: string
 *                     instructions:
 *                       type: string
 *       400:
 *         description: Invalid template type
 */
bulkUploadRouter.get('/template/:type', bulkUploadController.getUploadTemplate);

export default bulkUploadRouter;