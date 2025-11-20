import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../lib/s3.client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File) {
    // Upload to S3-compatible storage (MinIO)
    const bucket = process.env.MINIO_BUCKET || 'daira-uploads';
    const key = `${uuidv4()}-${file.originalname}`;
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      const url = `${process.env.MINIO_ENDPOINT || 'http://localhost:9000'}/${bucket}/${key}`;
      return { url, key };
    } catch (err) {
      throw new InternalServerErrorException('Failed to upload to object storage');
    }
  }
}
