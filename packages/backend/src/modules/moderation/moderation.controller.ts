import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
  Query,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { RoleGuard } from '@/guards/role.guard';
import { ModerationService } from './moderation.service';
import { PrismaService } from '@/lib/prisma';
import { Request } from 'express';

@Controller('api/admin/moderation')
@UseGuards(JwtAuthGuard, RoleGuard('ADMIN'))
export class ModerationController {
  private readonly logger = new Logger(ModerationController.name);

  constructor(
    private moderation: ModerationService,
    private prisma: PrismaService
  ) {}

  /**
   * GET /api/admin/moderation/flagged
   * Get list of flagged content pending review
   */
  @Get('flagged')
  async getFlaggedContent(
    @Query() { status = 'PENDING', limit = '20', offset = '0' }
  ) {
    const reviews = await this.prisma.moderationReview.findMany({
      where: { status },
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, firstName: true, email: true } },
      },
    });

    const total = await this.prisma.moderationReview.count({ where: { status } });

    return { reviews, total, page: parseInt(offset) / parseInt(limit) + 1 };
  }

  /**
   * POST /api/admin/moderation/review/:reviewId/approve
   * Approve flagged content
   */
  @Post('review/:reviewId/approve')
  async approveContent(@Param('reviewId') reviewId: string, @Req() req: Request) {
    const reviewerId = (req.user as any).id;

    try {
      await this.moderation.approveContent(reviewId, reviewerId);
      return { message: 'Content approved', reviewId };
    } catch (error) {
      this.logger.error(`Failed to approve content: ${error}`);
      throw error;
    }
  }

  /**
   * POST /api/admin/moderation/review/:reviewId/reject
   * Reject flagged content and remove it
   */
  @Post('review/:reviewId/reject')
  async rejectContent(
    @Param('reviewId') reviewId: string,
    @Body() { reason }: { reason: string },
    @Req() req: Request
  ) {
    const reviewerId = (req.user as any).id;

    if (!reason || reason.length < 10) {
      throw new ForbiddenException('Rejection reason must be at least 10 characters');
    }

    try {
      await this.moderation.rejectContent(reviewId, reviewerId, reason);
      return { message: 'Content rejected and removed', reviewId };
    } catch (error) {
      this.logger.error(`Failed to reject content: ${error}`);
      throw error;
    }
  }

  /**
   * GET /api/admin/moderation/stats
   * Get moderation dashboard statistics
   */
  @Get('stats')
  async getStats() {
    return this.moderation.getStats();
  }

  /**
   * POST /api/admin/moderation/user/:userId/warn
   * Issue warning to user
   */
  @Post('user/:userId/warn')
  async warnUser(
    @Param('userId') userId: string,
    @Body() { reason }: { reason: string },
    @Req() req: Request
  ) {
    const adminId = (req.user as any).id;

    try {
      await this.prisma.userWarning.create({
        data: {
          userId,
          reason,
          issuedBy: adminId,
          issuedAt: new Date(),
        },
      });

      // If 3 warnings, suspend account
      const warnings = await this.prisma.userWarning.count({
        where: { userId, isActive: true },
      });

      if (warnings >= 3) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { status: 'SUSPENDED' },
        });
        this.logger.warn(`User ${userId} suspended after 3 warnings`);
      }

      return { message: 'Warning issued', warnings };
    } catch (error) {
      this.logger.error(`Failed to warn user: ${error}`);
      throw error;
    }
  }

  /**
   * POST /api/admin/moderation/user/:userId/suspend
   * Suspend user account
   */
  @Post('user/:userId/suspend')
  async suspendUser(
    @Param('userId') userId: string,
    @Body() { reason, duration }: { reason: string; duration: number },
    @Req() req: Request
  ) {
    const adminId = (req.user as any).id;

    try {
      const suspensionUntil = new Date();
      suspensionUntil.setDate(suspensionUntil.getDate() + duration);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          status: 'SUSPENDED',
          suspensionReason: reason,
          suspensionUntil,
        },
      });

      this.logger.warn(`User ${userId} suspended for ${duration} days: ${reason}`);

      return {
        message: 'User suspended',
        userId,
        until: suspensionUntil,
      };
    } catch (error) {
      this.logger.error(`Failed to suspend user: ${error}`);
      throw error;
    }
  }

  /**
   * POST /api/admin/moderation/user/:userId/ban
   * Permanently ban user account
   */
  @Post('user/:userId/ban')
  async banUser(
    @Param('userId') userId: string,
    @Body() { reason }: { reason: string },
    @Req() req: Request
  ) {
    const adminId = (req.user as any).id;

    if (!reason || reason.length < 20) {
      throw new ForbiddenException('Ban reason must be at least 20 characters');
    }

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          status: 'BANNED',
          banReason: reason,
          bannedAt: new Date(),
        },
      });

      this.logger.error(`User ${userId} banned: ${reason}`);

      return { message: 'User permanently banned', userId };
    } catch (error) {
      this.logger.error(`Failed to ban user: ${error}`);
      throw error;
    }
  }
}
