import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '../core/object.storage';
import { nanoid } from 'nanoid';

export const uploadService = {
  async uploadFile(file: Express.Multer.File) {
    const key = `${Date.now()}-${nanoid()}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    
    return {
      url: `${process.env.BACKBLAZE_ENDPOINT}/${BUCKET_NAME}/${key}`,
      key,
      size: file.size,
      mimetype: file.mimetype
    };
  }
};