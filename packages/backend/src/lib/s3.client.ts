import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  region: process.env.MINIO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || 'miniouser',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'miniopass',
  },
  forcePathStyle: true,
});
