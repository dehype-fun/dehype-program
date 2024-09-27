// utils/cloudinaryUtils.ts
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


type ResourceType = 'image' | 'video' | 'raw' | 'auto';

/**
 * Upload a file to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {ResourceType} [resourceType='auto'] - The type of the resource (e.g., 'image', 'video', 'auto')
 * @returns {Promise<UploadApiResponse>} - The Cloudinary upload response
 */
export const uploadToCloudinary = (fileBuffer: Buffer, resourceType: ResourceType = 'auto'): Promise<UploadApiResponse> => {
  console.log('Uploading file to Cloudinary...', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY);
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: resourceType }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result as UploadApiResponse);
      }
    }).end(fileBuffer);
  });
};