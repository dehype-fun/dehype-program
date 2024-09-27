// routes/upload.ts
import express from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../utils/cloudinary'; // Adjust the path as necessary

const router = express.Router();
const upload = multer();

/**
 * @swagger
 * paths:
 *  /upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 url:
 *                   type: string
 *                   example: https://example.com/file.jpg
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No file uploaded
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).send({ error: 'No file uploaded' });
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer);
    console.info(`File uploaded to Cloudinary: ${result.secure_url}`);
    return res.status(200).send({ message: 'File uploaded successfully', url: result.secure_url });
  } catch (error) {
    console.error(`Error uploading file: ${(error as Error).message}`);
    return res.status(500).send({ error: 'Internal server error' });
  }
});

export default router;