import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ModerationService {
  private readonly blockedKeywords = [
    'hate-speech-term-1',
    'offensive-word',
    'spam-pattern',
    'harassment-term',
  ];

  constructor(private prisma: PrismaService) {}

  async checkContent(content: string): Promise<{
    isBlocked: boolean;
    reason?: string;
  }> {
    const lowerContent = content.toLowerCase();

    // Check for blocked keywords
    for (const keyword of this.blockedKeywords) {
      if (lowerContent.includes(keyword)) {
        return {
          isBlocked: true,
          reason: `Blocked keyword detected: ${keyword}`,
        };
      }
    }

    // Check for repeated characters (spam pattern: 10+ repeated chars)
    if (/(.)\1{9,}/.test(content)) {
      return {
        isBlocked: true,
        reason: 'Repeated characters detected (spam)',
      };
    }

    // Check for URL spam (more than 3 URLs)
    const urlCount = (content.match(/https?:\/\//g) || []).length;
    if (urlCount > 3) {
      return {
        isBlocked: true,
        reason: 'Too many links in content',
      };
    }

    // Check for excessive capitalization (>50% uppercase)
    const uppercase = (content.match(/[A-Z]/g) || []).length;
    if (uppercase / content.length > 0.5) {
      return {
        isBlocked: true,
        reason: 'Excessive capitalization detected',
      };
    }

    return { isBlocked: false };
  }

  async flagContent(
    contentId: string,
    contentType: string,
    reason: string,
    reportedBy?: string,
  ) {
    // Create a report record (schema needs Report model)
    // This is a placeholder for when Report model is added to Prisma
    return {
      contentId,
      contentType,
      reason,
      reportedBy,
      status: 'PENDING',
      createdAt: new Date(),
    };
  }

  async getReports(status?: string) {
    // Get reports from database (schema needs Report model)
    return [];
  }

  async approveReport(reportId: string) {
    // Mark report as approved and take action
    return { status: 'APPROVED' };
  }

  async rejectReport(reportId: string) {
    // Mark report as rejected
    return { status: 'REJECTED' };
  }

  // Add keywords to blocklist (admin only)
  async addBlockedKeyword(keyword: string) {
    this.blockedKeywords.push(keyword.toLowerCase());
    return { keyword, added: true };
  }

  // Remove keywords from blocklist (admin only)
  async removeBlockedKeyword(keyword: string) {
    const index = this.blockedKeywords.indexOf(keyword.toLowerCase());
    if (index > -1) {
      this.blockedKeywords.splice(index, 1);
      return { keyword, removed: true };
    }
    return { keyword, removed: false };
  }

  // Get current blocklist
  async getBlockedKeywords() {
    return this.blockedKeywords;
  }
}
