import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { BullModule } from '@nestjs/bull'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { FeedModule } from './feed/feed.module'
import { MediaModule } from './media/media.module'
import { InteractionModule } from './interaction/interaction.module'
import { WalletModule } from './wallet/wallet.module'
import { RecommendationModule } from './recommendation/recommendation.module'
import { RealtimeModule } from './realtime/realtime.module'
import { ModerationModule } from './moderation/moderation.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { WebhookModule } from './webhook/webhook.module'
import { HealthController } from '@/lib/health.controller'
import configuration from '@/config/configuration'

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: '.env.local',
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),

    // GraphQL Federation
    GraphQLModule.forRoot({
      autoSchemaFile: '@/schema.graphql',
      federated: true,
      buildSchemaOptions: {
        orphanedTypes: [],
      },
      context: ({ req }) => ({ req }),
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
    }),

    // Bull Job Queues
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: 0,
      },
    }),
    BullModule.registerQueue(
      { name: 'video-transcoding' },
      { name: 'recommendations' },
      { name: 'notifications' },
      { name: 'email' },
      { name: 'analytics' }
    ),

    // Microservices
    AuthModule,
    UserModule,
    FeedModule,
    MediaModule,
    InteractionModule,
    WalletModule,
    RecommendationModule,
    RealtimeModule,
    ModerationModule,
    AnalyticsModule,
    WebhookModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
