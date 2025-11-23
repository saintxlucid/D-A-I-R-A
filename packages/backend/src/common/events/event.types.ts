/**
 * Event Type System
 *
 * Defines all events flowing through the circulatory system.
 * Each event has:
 * - Type (unique identifier)
 * - Payload (data structure)
 * - Handler (who processes it)
 * - Queue (where it goes)
 * - Priority (execution order)
 */

// ════════════════════════════════════════════════════════════════
// USER EVENTS
// ════════════════════════════════════════════════════════════════

export interface UserCreatedEvent {
  type: 'user.created';
  userId: string;
  email: string;
  phone: string;
  displayName: string;
  createdAt: Date;
}

export interface UserVerifiedEvent {
  type: 'user.verified';
  userId: string;
  verificationMethod: 'FLASH_CALL' | 'WHATSAPP_OTP' | 'SMS_OTP';
  verifiedAt: Date;
}

export interface UserFollowedEvent {
  type: 'user.followed';
  followerId: string;
  followeeId: string;
  timestamp: Date;
}

export interface UserBlockedEvent {
  type: 'user.blocked';
  blockerId: string;
  blockedId: string;
  reason?: string;
  timestamp: Date;
}

// ════════════════════════════════════════════════════════════════
// CONTENT EVENTS (Posts, Videos, Comments)
// ════════════════════════════════════════════════════════════════

export interface PostCreatedEvent {
  type: 'post.created';
  postId: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  mentions: string[];
  createdAt: Date;
}

export interface PostDeletedEvent {
  type: 'post.deleted';
  postId: string;
  authorId: string;
  reason?: string;
  deletedAt: Date;
}

export interface VideoUploadedEvent {
  type: 'video.uploaded';
  videoId: string;
  authorId: string;
  fileName: string;
  fileSize: number;
  duration?: number;
  uploadedAt: Date;
}

export interface VideoTranscodeStartedEvent {
  type: 'video.transcode.started';
  videoId: string;
  sourceUrl: string;
  targetQualities: ('360p' | '480p' | '720p' | '1080p')[];
  startedAt: Date;
}

export interface VideoTranscodeCompletedEvent {
  type: 'video.transcode.completed';
  videoId: string;
  outputUrls: Record<string, string>;
  thumbnailUrl: string;
  completedAt: Date;
  duration: number;
}

export interface CommentAddedEvent {
  type: 'comment.added';
  commentId: string;
  postId?: string;
  videoId?: string;
  authorId: string;
  content: string;
  parentCommentId?: string;
  mentions: string[];
  createdAt: Date;
}

// ════════════════════════════════════════════════════════════════
// INTERACTION EVENTS (Likes, Reactions, Shares)
// ════════════════════════════════════════════════════════════════

export interface LikeAddedEvent {
  type: 'like.added';
  likeId: string;
  userId: string;
  postId?: string;
  commentId?: string;
  videoId?: string;
  createdAt: Date;
}

export interface LikeRemovedEvent {
  type: 'like.removed';
  likeId: string;
  userId: string;
  postId?: string;
  commentId?: string;
  videoId?: string;
  removedAt: Date;
}

export interface ShareCreatedEvent {
  type: 'share.created';
  shareId: string;
  userId: string;
  contentId: string;
  contentType: 'POST' | 'VIDEO' | 'COMMENT';
  sharedAt: Date;
}

// ════════════════════════════════════════════════════════════════
// FEED EVENTS (Fan-Out, Refresh)
// ════════════════════════════════════════════════════════════════

export interface FeedFanOutEvent {
  type: 'feed.fan-out';
  postId: string;
  authorId: string;
  followers: string[];
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  createdAt: Date;
}

export interface FeedRefreshEvent {
  type: 'feed.refresh';
  userId: string;
  feedType: 'CIRCLE' | 'DISCOVER' | 'TRENDING';
  refreshedAt: Date;
}

// ════════════════════════════════════════════════════════════════
// NOTIFICATION EVENTS
// ════════════════════════════════════════════════════════════════

export interface NotificationCreatedEvent {
  type: 'notification.created';
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  notificationType: 'FOLLOW' | 'LIKE' | 'COMMENT' | 'MENTION' | 'MESSAGE' | 'SYSTEM';
  relatedEntityId?: string;
  relatedUserId?: string;
  createdAt: Date;
}

export interface NotificationSentEvent {
  type: 'notification.sent';
  notificationId: string;
  userId: string;
  channel: 'PUSH' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';
  sentAt: Date;
}

export interface NotificationReadEvent {
  type: 'notification.read';
  notificationId: string;
  userId: string;
  readAt: Date;
}

// ════════════════════════════════════════════════════════════════
// PAYMENT & WALLET EVENTS
// ════════════════════════════════════════════════════════════════

export interface PaymentInitiatedEvent {
  type: 'payment.initiated';
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  method: 'FAWRY' | 'VODAFONE_CASH' | 'CARD';
  initiatedAt: Date;
}

export interface PaymentCompletedEvent {
  type: 'payment.completed';
  paymentId: string;
  userId: string;
  amount: number;
  transactionId: string;
  completedAt: Date;
}

export interface PaymentFailedEvent {
  type: 'payment.failed';
  paymentId: string;
  userId: string;
  reason: string;
  failedAt: Date;
}

export interface WalletUpdatedEvent {
  type: 'wallet.updated';
  walletId: string;
  userId: string;
  previousBalance: number;
  newBalance: number;
  changeAmount: number;
  changeType: 'DEPOSIT' | 'WITHDRAWAL' | 'TIP' | 'EARNING';
  updatedAt: Date;
}

// ════════════════════════════════════════════════════════════════
// MODERATION EVENTS
// ════════════════════════════════════════════════════════════════

export interface ContentFlaggedEvent {
  type: 'content.flagged';
  contentId: string;
  contentType: 'POST' | 'VIDEO' | 'COMMENT' | 'USER_PROFILE';
  reason: 'SPAM' | 'VIOLENCE' | 'HATE_SPEECH' | 'NSFW' | 'MISINFORMATION' | 'OTHER';
  flaggedBy: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  flaggedAt: Date;
}

export interface ContentModerationReviewedEvent {
  type: 'content.moderation_reviewed';
  contentId: string;
  moderatorId: string;
  decision: 'APPROVED' | 'REMOVED' | 'FLAGGED';
  reason?: string;
  reviewedAt: Date;
}

export interface UserMutedEvent {
  type: 'user.muted';
  muterId: string;
  mutedId: string;
  reason?: string;
  timestamp: Date;
}

// ════════════════════════════════════════════════════════════════
// ANALYTICS & TRACKING EVENTS
// ════════════════════════════════════════════════════════════════

export interface VideoViewedEvent {
  type: 'video.viewed';
  videoId: string;
  userId: string;
  viewedAt: Date;
  watchDuration: number;
  watchPercentage: number;
  source: 'CIRCLE' | 'DISCOVER' | 'SEARCH' | 'PROFILE';
  deviceType: 'MOBILE' | 'TABLET' | 'DESKTOP';
  networkQuality: 'WIFI' | '5G' | '4G' | '3G' | 'UNKNOWN';
}

export interface ContentEngagementEvent {
  type: 'content.engagement';
  contentId: string;
  userId: string;
  engagementType: 'VIEW' | 'LIKE' | 'COMMENT' | 'SHARE' | 'SAVE';
  engagementValue: number;
  engagedAt: Date;
  source: 'CIRCLE' | 'DISCOVER' | 'SEARCH' | 'PROFILE';
}

export interface SearchPerformedEvent {
  type: 'search.performed';
  userId: string;
  query: string;
  resultsCount: number;
  searchedAt: Date;
  searchType: 'USERS' | 'VIDEOS' | 'HASHTAGS' | 'TRENDING';
}

export interface UserInterestEvent {
  type: 'user.interest';
  userId: string;
  interestType: 'FOLLOW' | 'VIEW' | 'ENGAGE' | 'SAVE';
  entityId: string;
  entityType: 'USER' | 'VIDEO' | 'HASHTAG' | 'CATEGORY';
  timestamp: Date;
}

// ════════════════════════════════════════════════════════════════
// ML/AI & RECOMMENDATION EVENTS
// ════════════════════════════════════════════════════════════════

export interface UserVectorUpdateEvent {
  type: 'user.vector_update';
  userId: string;
  previousVector: number[];
  newVector: number[];
  triggerEvent: string;
  updatedAt: Date;
}

export interface VideoEmbeddingGeneratedEvent {
  type: 'video.embedding_generated';
  videoId: string;
  embedding: number[];
  model: 'CLIP' | 'SELF_SUPERVISED';
  generatedAt: Date;
}

export interface RecommendationServedEvent {
  type: 'recommendation.served';
  userId: string;
  recommendationId: string;
  recommendedItems: Array<{ id: string; score: number; rank: number }>;
  algorithm: 'TWO_TOWER' | 'COLLABORATIVE' | 'TRENDING' | 'SOCIAL';
  servedAt: Date;
}

// ════════════════════════════════════════════════════════════════
// MESSAGING EVENTS
// ════════════════════════════════════════════════════════════════

export interface MessageSentEvent {
  type: 'message.sent';
  messageId: string;
  senderId: string;
  recipientId: string;
  content: string;
  mediaUrls: string[];
  sentAt: Date;
}

export interface MessageDeliveredEvent {
  type: 'message.delivered';
  messageId: string;
  deliveredAt: Date;
}

export interface MessageReadEvent {
  type: 'message.read';
  messageId: string;
  readAt: Date;
}

export interface TypingIndicatorEvent {
  type: 'typing.indicator';
  userId: string;
  recipientId: string;
  isTyping: boolean;
  timestamp: Date;
}

// ════════════════════════════════════════════════════════════════
// ADMIN & SYSTEM EVENTS
// ════════════════════════════════════════════════════════════════

export interface AdminActionEvent {
  type: 'admin.action';
  adminId: string;
  action: 'USER_SUSPEND' | 'USER_BAN' | 'CONTENT_REMOVE' | 'SYSTEM_CONFIG' | 'OTHER';
  targetId: string;
  reason?: string;
  performedAt: Date;
}

export interface SystemHealthEvent {
  type: 'system.health';
  service: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  timestamp: Date;
  metrics?: Record<string, number>;
}

// ════════════════════════════════════════════════════════════════
// UNION TYPE: All Events
// ════════════════════════════════════════════════════════════════

export type DomainEvent =
  | UserCreatedEvent
  | UserVerifiedEvent
  | UserFollowedEvent
  | UserBlockedEvent
  | PostCreatedEvent
  | PostDeletedEvent
  | VideoUploadedEvent
  | VideoTranscodeStartedEvent
  | VideoTranscodeCompletedEvent
  | CommentAddedEvent
  | LikeAddedEvent
  | LikeRemovedEvent
  | ShareCreatedEvent
  | FeedFanOutEvent
  | FeedRefreshEvent
  | NotificationCreatedEvent
  | NotificationSentEvent
  | NotificationReadEvent
  | PaymentInitiatedEvent
  | PaymentCompletedEvent
  | PaymentFailedEvent
  | WalletUpdatedEvent
  | ContentFlaggedEvent
  | ContentModerationReviewedEvent
  | UserMutedEvent
  | VideoViewedEvent
  | ContentEngagementEvent
  | SearchPerformedEvent
  | UserInterestEvent
  | UserVectorUpdateEvent
  | VideoEmbeddingGeneratedEvent
  | RecommendationServedEvent
  | MessageSentEvent
  | MessageDeliveredEvent
  | MessageReadEvent
  | TypingIndicatorEvent
  | AdminActionEvent
  | SystemHealthEvent;

// Event routing: which queue each event goes to
export const eventQueueMapping: Record<string, string> = {
  'user.created': 'notifications',
  'user.verified': 'notifications',
  'user.followed': 'feedFanOut',
  'post.created': 'feedFanOut',
  'video.uploaded': 'videoTranscode',
  'video.transcode.completed': 'videoAnalytics',
  'like.added': 'eventTracking',
  'comment.added': 'notifications',
  'payment.completed': 'payments',
  'notification.created': 'notifications',
  'content.flagged': 'contentModeration',
  'video.viewed': 'eventTracking',
  'message.sent': 'notifications',
  'admin.action': 'adminActions',
};

// Event priorities for BullMQ
export const eventPriorityMapping: Record<string, number> = {
  'payment.completed': 10,
  'payment.failed': 10,
  'admin.action': 9,
  'notification.created': 8,
  'post.created': 8,
  'feed.fan-out': 9,
  'user.followed': 8,
  'comment.added': 7,
  'like.added': 5,
  'video.viewed': 2,
  'user.interest': 2,
  'message.sent': 7,
};
