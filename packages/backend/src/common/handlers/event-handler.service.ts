import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventBusService } from '../services/event-bus.service';
import { RealtimeEventHub } from '../services/realtime-event-hub.service';
import {
  UserCreatedEvent,
  PostCreatedEvent,
  VideoUploadedEvent,
  LikeAddedEvent,
  CommentAddedEvent,
  PaymentCompletedEvent,
  NotificationCreatedEvent,
  VideoTranscodeCompletedEvent,
  FeedFanOutEvent,
  UserVerifiedEvent,
  ContentFlaggedEvent,
  MessageSentEvent,
} from '../events/event.types';

/**
 * Event Handler Service
 *
 * Central hub for handling domain events across the system.
 * Each handler is triggered by specific events and performs business logic.
 */
@Injectable()
export class EventHandlerService implements OnModuleInit {
  private readonly logger = new Logger(EventHandlerService.name);

  constructor(
    private eventBus: EventBusService,
    private realtimeHub: RealtimeEventHub,
  ) {}

  onModuleInit() {
    this.logger.log('🔌 Event handlers registered');
  }

  // ════════════════════════════════════════════════════════════════
  // USER LIFECYCLE EVENTS
  // ════════════════════════════════════════════════════════════════

  @OnEvent('user:created', { async: true })
  async handleUserCreated(event: UserCreatedEvent) {
    this.logger.log(`👤 New user created: ${event.userId}`);

    // Initialize user profile & settings
    // Send welcome notification
    // Add to user index for search
    // Log to analytics
  }

  @OnEvent('user:verified', { async: true })
  async handleUserVerified(event: UserVerifiedEvent) {
    this.logger.log(`✅ User verified: ${event.userId}`);

    // Mark user as verified
    // Unlock features
    // Send verification complete notification
  }

  // ════════════════════════════════════════════════════════════════
  // CONTENT CREATION EVENTS
  // ════════════════════════════════════════════════════════════════

  @OnEvent('post:created', { async: true })
  async handlePostCreated(event: PostCreatedEvent) {
    this.logger.log(`📝 Post created: ${event.postId} by ${event.authorId}`);

    // Trigger feed fan-out
    await this.eventBus.publish<FeedFanOutEvent>({
      type: 'feed.fan-out',
      postId: event.postId,
      authorId: event.authorId,
      followers: [], // Will be fetched in fan-out handler
      priority: 'HIGH',
      createdAt: event.createdAt,
    });

    // Update user statistics
    // Index for search
    // Broadcast real-time update
  }

  @OnEvent('video:uploaded', { async: true })
  async handleVideoUploaded(event: VideoUploadedEvent) {
    this.logger.log(`🎥 Video uploaded: ${event.videoId} (${event.fileSize} bytes)`);

    // Validate video file
    // Queue for transcoding
    // Extract thumbnail
    // Store metadata
  }

  // ════════════════════════════════════════════════════════════════
  // INTERACTION EVENTS
  // ════════════════════════════════════════════════════════════════

  @OnEvent('like:added', { async: true })
  async handleLikeAdded(event: LikeAddedEvent) {
    this.logger.debug(`❤️  Like added: ${event.userId} -> ${event.postId || event.videoId}`);

    // Update engagement metrics
    // Notify content author
    // Update user interest vector (for recommendations)
    // Broadcast real-time update
  }

  @OnEvent('comment:added', { async: true })
  async handleCommentAdded(event: CommentAddedEvent) {
    this.logger.log(`💬 Comment added: ${event.commentId}`);

    // Store comment
    // Notify post author
    // Notify mentioned users
    // Update engagement metrics
    // Broadcast real-time update
  }

  // ════════════════════════════════════════════════════════════════
  // PAYMENT EVENTS
  // ════════════════════════════════════════════════════════════════

  @OnEvent('payment:completed', { async: true })
  async handlePaymentCompleted(event: PaymentCompletedEvent) {
    this.logger.log(`💳 Payment completed: ${event.paymentId} (${event.amount})`);

    // Update wallet balance
    // Update transaction history
    // Notify user
    // Send receipt
    // Trigger fulfillment (if applicable)
  }

  // ════════════════════════════════════════════════════════════════
  // NOTIFICATION EVENTS
  // ════════════════════════════════════════════════════════════════

  @OnEvent('notification:created', { async: true })
  async handleNotificationCreated(event: NotificationCreatedEvent) {
    this.logger.log(`🔔 Notification created for user: ${event.userId}`);

    // Queue notification delivery across channels
    // Store in database
    // Broadcast via WebSocket
  }

  // ════════════════════════════════════════════════════════════════
  // VIDEO PROCESSING EVENTS
  // ════════════════════════════════════════════════════════════════

  @OnEvent('video:transcode.completed', { async: true })
  async handleVideoTranscodeCompleted(event: VideoTranscodeCompletedEvent) {
    this.logger.log(`✅ Video transcoding completed: ${event.videoId}`);

    // Update video status
    // Store output URLs
    // Generate vector embedding for recommendations
    // Notify user
    // Update search index
  }

  // ════════════════════════════════════════════════════════════════
  // FEED EVENTS
  // ════════════════════════════════════════════════════════════════

  @OnEvent('feed:fan-out', { async: true })
  async handleFeedFanOut(event: FeedFanOutEvent) {
    this.logger.log(`📢 Fan-out post ${event.postId} to followers`);

    // Fetch followers of author
    // Push post to each follower's feed in Redis
    // Update feed metadata
  }

  // ════════════════════════════════════════════════════════════════
  // MODERATION EVENTS
  // ════════════════════════════════════════════════════════════════

  @OnEvent('content:flagged', { async: true })
  async handleContentFlagged(event: ContentFlaggedEvent) {
    this.logger.log(
      `⚠️  Content flagged: ${event.contentId} (${event.reason}, severity: ${event.severity})`,
    );

    // Store flag report
    // Queue for moderation review
    // If severity is critical, auto-hide content
    // Notify moderators
  }

  // ════════════════════════════════════════════════════════════════
  // MESSAGING EVENTS
  // ════════════════════════════════════════════════════════════════

  @OnEvent('message:sent', { async: true })
  async handleMessageSent(event: MessageSentEvent) {
    this.logger.log(`💌 Message sent: ${event.messageId}`);

    // Store message
    // Broadcast to recipient (if online)
    // Queue notification if offline
    // Update conversation metadata
  }

  // ════════════════════════════════════════════════════════════════
  // BATCH EVENT HANDLERS
  // ════════════════════════════════════════════════════════════════

  /**
   * Handle feed refresh for multiple feeds
   */
  @OnEvent('feed:refresh', { async: true })
  async handleFeedRefresh(event: any) {
    this.logger.log(`🔄 Feed refresh: ${event.userId} (${event.feedType})`);

    // Fetch latest posts/recommendations
    // Update cache
    // Broadcast to user's WebSocket connections
  }

  /**
   * Batch handler for event tracking
   */
  @OnEvent('queue:event-tracking', { async: true })
  async handleEventTrackingBatch(events: any[]) {
    if (Array.isArray(events)) {
      this.logger.debug(`📊 Processing ${events.length} tracking events`);

      // Aggregate events
      // Store in analytics database
      // Update user interest vectors
    }
  }

  /**
   * Batch handler for analytics aggregation
   */
  @OnEvent('queue:analytics-aggregation', { async: true })
  async handleAnalyticsAggregation(data: any) {
    this.logger.debug(`📈 Aggregating analytics data`);

    // Compute trending content
    // Update creator statistics
    // Update platform metrics
  }

  /**
   * Batch handler for vector embeddings
   */
  @OnEvent('queue:vector-embedding', { async: true })
  async handleVectorEmbedding(data: any) {
    this.logger.debug(`🧠 Generating vector embeddings`);

    // Generate video embeddings via CLIP
    // Store in Qdrant
    // Update recommendation model
  }

  /**
   * Batch handler for notifications
   */
  @OnEvent('queue:notifications', { async: true })
  async handleNotificationQueue(notification: any) {
    this.logger.debug(`🔔 Sending notification: ${notification.notificationId}`);

    // Send push notification
    // Send email notification
    // Send SMS notification
    // Update delivery status
  }

  /**
   * Batch handler for payments
   */
  @OnEvent('queue:payments', { async: true })
  async handlePaymentQueue(payment: any) {
    this.logger.debug(`💳 Processing payment: ${payment.paymentId}`);

    // Verify payment status
    // Update user wallet
    // Send receipt
    // Log transaction
  }

  /**
   * Batch handler for content moderation
   */
  @OnEvent('queue:content-moderation', { async: true })
  async handleModerationQueue(data: any) {
    this.logger.debug(`🛡️  Moderating content: ${data.contentId}`);

    // Check against moderation rules
    // Check against profanity filters
    // Check against AWS Rekognition (images/videos)
    // Queue for manual review if needed
  }

  /**
   * Error handler for failed events
   */
  @OnEvent('error:*', { async: true })
  async handleError(event: any) {
    this.logger.error(`❌ Event error: ${event.type}`, event.error);

    // Log to error tracking
    // Alert admin if critical
    // Retry with exponential backoff
  }
}
