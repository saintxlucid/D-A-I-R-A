export default () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  SCYLLA_CONTACT_POINTS: (process.env.SCYLLA_CONTACT_POINTS || 'localhost:9042').split(','),
  QDRANT_URL: process.env.QDRANT_URL || 'http://localhost:6333',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '7d',

  // Auth
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY,
  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL,

  // Storage
  S3_BUCKET: process.env.S3_BUCKET,
  S3_REGION: process.env.S3_REGION || 'us-east-1',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  CLOUDFLARE_R2_ENDPOINT: process.env.CLOUDFLARE_R2_ENDPOINT,

  // Payments
  FAWRY_API_KEY: process.env.FAWRY_API_KEY,
  FAWRY_MERCHANT_ID: process.env.FAWRY_MERCHANT_ID,
  VODAFONE_CASH_API_KEY: process.env.VODAFONE_CASH_API_KEY,

  // Video Processing
  FFMPEG_PATH: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
  VIDEO_UPLOAD_DIR: process.env.VIDEO_UPLOAD_DIR || '/tmp/uploads',
  VIDEO_OUTPUT_DIR: process.env.VIDEO_OUTPUT_DIR || '/tmp/outputs',

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',

  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,
  SIGNOZ_ENDPOINT: process.env.SIGNOZ_ENDPOINT,

  // Features
  ENABLE_VECTOR_SEARCH: process.env.ENABLE_VECTOR_SEARCH === 'true',
  ENABLE_LIVE_STREAM: process.env.ENABLE_LIVE_STREAM === 'true',
  MAX_VIDEO_SIZE_MB: parseInt(process.env.MAX_VIDEO_SIZE_MB || '500', 10),
})
