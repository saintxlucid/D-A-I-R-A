import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma';
import { ConfigService } from '@nestjs/config';

/**
 * PDPL Compliance Service
 * Implements Egyptian Personal Data Protection Law (Law 151/2020)
 *
 * Key Requirements:
 * - Data Protection Officer (DPO) appointment
 * - Explicit user consent for data processing
 * - Right to access, rectification, erasure
 * - Data breach notification within 72 hours
 * - Data retention policies
 * - Data minimization
 */
@Injectable()
export class PDPLComplianceService {
  private readonly logger = new Logger(PDPLComplianceService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {}

  /**
   * Record user consent for data processing
   * Required for PDPL compliance
   */
  async recordUserConsent(
    userId: string,
    consentTypes: string[], // 'MARKETING', 'ANALYTICS', 'PROFILING', 'THIRD_PARTY'
    ipAddress: string
  ): Promise<void> {
    try {
      for (const consentType of consentTypes) {
        await this.prisma.userConsent.create({
          data: {
            userId,
            consentType,
            ipAddress,
            userAgent: '',
            timestamp: new Date(),
            version: this.getConsent Version(),
          },
        });
      }
      this.logger.log(`User consent recorded for ${userId}: ${consentTypes.join(', ')}`);
    } catch (error) {
      this.logger.error(`Failed to record consent: ${error}`);
      throw error;
    }
  }

  /**
   * Implement right to be forgotten (GDPR Article 17 equivalent)
   * Delete all personal user data while maintaining audit trail
   */
  async deleteUserData(userId: string): Promise<void> {
    try {
      // Step 1: Retrieve user record
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Step 2: Anonymize user data
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${Date.now()}@deleted.invalid`,
          firstName: 'Deleted',
          lastName: 'User',
          bio: null,
          avatar: null,
          status: 'DELETED',
        },
      });

      // Step 3: Anonymize posts (keep for audit, remove personal data)
      await this.prisma.post.updateMany({
        where: { authorId: userId },
        data: {
          authorId: null,
          authorName: 'Deleted User',
          content: '[Content removed per user request]',
        },
      });

      // Step 4: Delete sensitive data
      await this.prisma.userConsent.deleteMany({ where: { userId } });
      await this.prisma.session.deleteMany({ where: { userId } });

      // Step 5: Log deletion event for audit
      await this.recordAuditEvent({
        action: 'USER_DATA_DELETED',
        userId,
        ipAddress: '',
        details: { originalEmail: user.email },
      });

      this.logger.warn(`User data deleted for ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete user data: ${error}`);
      throw error;
    }
  }

  /**
   * Report data breach within 72 hours (PDPL requirement)
   */
  async reportDataBreach(
    breachDescription: string,
    affectedDataTypes: string[],
    affectedUserCount: number
  ): Promise<void> {
    try {
      // Create breach record
      await this.prisma.dataBreach.create({
        data: {
          description: breachDescription,
          affectedDataTypes,
          affectedUserCount,
          reportedAt: new Date(),
          reportedTo: 'IDPC', // Information & Documentation Center
          status: 'REPORTED',
        },
      });

      // Log audit event
      await this.recordAuditEvent({
        action: 'DATA_BREACH_REPORTED',
        userId: 'SYSTEM',
        details: {
          affectedUsers: affectedUserCount,
          dataTypes: affectedDataTypes,
        },
      });

      this.logger.error(`Data breach reported: ${breachDescription}`);
    } catch (error) {
      this.logger.error(`Failed to report breach: ${error}`);
      throw error;
    }
  }

  /**
   * Get user's personal data for export (PDPL Article 19 - Right of Access)
   */
  async exportUserData(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: true,
        follows: true,
        followers: true,
        consents: true,
      },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Log data export for audit
    await this.recordAuditEvent({
      action: 'USER_DATA_EXPORTED',
      userId,
      details: { exportedAt: new Date() },
    });

    return {
      user,
      exportedAt: new Date(),
      dpaCompliance: 'PDPL Law 151/2020',
    };
  }

  /**
   * Audit trail logging
   */
  private async recordAuditEvent(event: {
    action: string;
    userId: string;
    ipAddress?: string;
    details?: any;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: event.action,
          userId: event.userId,
          ipAddress: event.ipAddress || '',
          details: event.details,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to record audit event: ${error}`);
    }
  }

  /**
   * Get current consent version
   */
  private getConsentVersion(): string {
    return this.config.get('CONSENT_VERSION', '1.0.0');
  }

  /**
   * Check if user has given required consent
   */
  async hasConsent(userId: string, consentType: string): Promise<boolean> {
    const consent = await this.prisma.userConsent.findFirst({
      where: { userId, consentType },
    });
    return !!consent;
  }

  /**
   * Revoke user consent
   */
  async revokeConsent(userId: string, consentType: string): Promise<void> {
    await this.prisma.userConsent.deleteMany({
      where: { userId, consentType },
    });

    await this.recordAuditEvent({
      action: 'CONSENT_REVOKED',
      userId,
      details: { consentType },
    });

    this.logger.log(`Consent revoked for ${userId}: ${consentType}`);
  }
}
