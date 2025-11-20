import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '@/lib/prisma';

/**
 * Content Moderation Service
 * 3-layer moderation: Keyword filter → AI classification → Human review
 * Optimized for Egyptian Arabic dialect
 */
@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private redis: Redis;

  constructor(private prisma: PrismaService) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    this.initializeBloomFilter();
  }

  /**
   * Layer 1: Keyword Bloom Filter (fast, false-positive tolerant)
   * Detects banned keywords in Egyptian Arabic + Franco-Arabic
   */
  private async initializeBloomFilter(): Promise<void> {
    try {
      // Check if already initialized
      const exists = await this.redis.get('moderation:initialized');
      if (exists) return;

      // Banned keywords (Egyptian slang + formal)
      const bannedKeywords = [
        // Egyptian slang profanity
        'حرام', 'وسخ', 'ملعون', 'قذر', 'خسيس',
        // Franco-Arabic equivalents
        '7aram', 'weskh', 'mo7ram', '3erfan',
        // Hate speech indicators
        'إرهابي', 'إرهاب', 'تفجير',
        '3irhabi', 'khaen',
        // Dehumanizing language
        'حيوان', '7aywan', 'bass',
      ];

      // Store in Redis Bloom Filter
      for (const keyword of bannedKeywords) {
        try {
          await this.redis.bf.add('moderation:keywords', keyword);
        } catch (error) {
          // Fallback to regular set if Bloom Filter unavailable
          await this.redis.sadd('moderation:keywords:fallback', keyword);
        }
      }

      await this.redis.set('moderation:initialized', '1', 'EX', 86400);
      this.logger.log('Moderation bloom filter initialized');
    } catch (error) {
      this.logger.error('Failed to initialize bloom filter:', error);
    }
  }

  /**
   * Check content for moderation violations
   * Returns moderation decision and confidence
   */
  async checkContent(content: string): Promise<{
    isViolation: boolean;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    reasons: string[];
    confidence: number;
  }> {
    const reasons: string[] = [];
    let confidence = 0;

    // Layer 1: Keyword filter (fast)
    const keywordViolation = await this.checkKeywords(content);
    if (keywordViolation) {
      reasons.push('BANNED_KEYWORDS');
      confidence = Math.max(confidence, 0.95); // High confidence for keywords
    }

    // Layer 2: Pattern matching (hate speech, spam indicators)
    const patternViolation = this.checkPatterns(content);
    if (patternViolation) {
      reasons.push('SUSPICIOUS_PATTERN');
      confidence = Math.max(confidence, 0.70);
    }

    // Layer 3: AI classification (async, lower confidence)
    if (confidence < 0.7 && content.length > 20) {
      const aiClassification = await this.classifyWithAI(content);
      if (aiClassification) {
        reasons.push('AI_CLASSIFICATION');
        confidence = Math.max(confidence, aiClassification.confidence);
      }
    }

    // Determine severity
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (confidence >= 0.9) severity = 'HIGH';
    else if (confidence >= 0.7) severity = 'MEDIUM';

    return {
      isViolation: confidence >= 0.6,
      severity,
      reasons,
      confidence,
    };
  }

  /**
   * Check for banned keywords using Bloom Filter
   */
  private async checkKeywords(content: string): Promise<boolean> {
    const words = content.toLowerCase().split(/\s+|[-،\.!؟]/);

    for (const word of words) {
      if (word.length < 3) continue; // Skip short words

      try {
        // Try Bloom Filter first
        const exists = await this.redis.bf.exists('moderation:keywords', word);
        if (exists) return true;
      } catch (error) {
        // Fallback to regular set
        const exists = await this.redis.sismember('moderation:keywords:fallback', word);
        if (exists) return true;
      }
    }

    return false;
  }

  /**
   * Pattern matching for common violations
   */
  private checkPatterns(content: string): boolean {
    // Check for spam indicators
    if (/(.)\1{4,}/.test(content)) return true; // Repeated characters
    if (content.match(/http|www/gi)?.length || 0 > 2) return true; // Excessive links
    if (/@/.test(content) && content.length < 50) return true; // Mentions without context

    // Check for hate speech patterns
    const hatePatterns = [
      /كل\s+(?:المصريين|الشعب)/i, // "All Egyptians"
      /يستحق\s+(?:الموت|التعذيب)/i, // "deserve death/torture"
    ];
    return hatePatterns.some((p) => p.test(content));
  }

  /**
   * Layer 3: AI classification using MarBERT
   * Async operation - results cached for similar content
   */
  private async classifyWithAI(content: string): Promise<{ confidence: number } | null> {
    try {
      // Check cache first
      const cacheKey = `ai:${this.hashContent(content)}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // TODO: Integrate MarBERT model
      // const classification = await marbert.classify(content);
      // For now, return null (model integration in Phase 3.5)
      return null;
    } catch (error) {
      this.logger.warn('AI classification failed:', error);
      return null;
    }
  }

  /**
   * Create moderation review task for human review
   */
  async createReviewTask(
    contentId: string,
    contentType: 'POST' | 'COMMENT' | 'MESSAGE',
    content: string,
    authorId: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
  ): Promise<void> {
    try {
      await this.prisma.moderationReview.create({
        data: {
          contentId,
          contentType,
          content,
          authorId,
          severity,
          status: 'PENDING',
          createdAt: new Date(),
        },
      });

      this.logger.log(`Moderation review created for ${contentId} (${severity})`);
    } catch (error) {
      this.logger.error('Failed to create review task:', error);
    }
  }

  /**
   * Approve content after human review
   */
  async approveContent(reviewId: string, reviewer Id: string): Promise<void> {
    await this.prisma.moderationReview.update({
      where: { id: reviewId },
      data: {
        status: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });

    this.logger.log(`Content approved by ${reviewerId}`);
  }

  /**
   * Reject content after human review
   */
  async rejectContent(reviewId: string, reviewerId: string, reason: string): Promise<void> {
    const review = await this.prisma.moderationReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new Error('Review not found');

    // Remove/hide content
    if (review.contentType === 'POST') {
      await this.prisma.post.update({
        where: { id: review.contentId },
        data: { status: 'DELETED', deletedReason: reason },
      });
    }

    // Mark review as rejected
    await this.prisma.moderationReview.update({
      where: { id: reviewId },
      data: {
        status: 'REJECTED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        notes: reason,
      },
    });

    this.logger.log(`Content rejected: ${reason}`);
  }

  /**
   * Hash content for caching AI results
   */
  private hashContent(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get moderation statistics
   */
  async getStats(): Promise<any> {
    const [flagged, reviewed, approved, rejected] = await Promise.all([
      this.prisma.post.count({ where: { status: 'FLAGGED' } }),
      this.prisma.moderationReview.count({ where: { status: 'REVIEWED' } }),
      this.prisma.moderationReview.count({ where: { status: 'APPROVED' } }),
      this.prisma.moderationReview.count({ where: { status: 'REJECTED' } }),
    ]);

    return { flagged, reviewed, approved, rejected };
  }
}
