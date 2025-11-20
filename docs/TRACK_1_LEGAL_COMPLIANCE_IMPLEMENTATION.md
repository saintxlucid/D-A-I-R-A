# Track 1: Legal & Compliance Implementation (Weeks 1-2)

**Owner:** CEO + Legal Lead  
**Timeline:** 14 days (parallel with frontend/video work)  
**Budget:** $500-1,000 (templates provided; legal review additional)  
**Goal:** Achieve legal operability + content moderation foundation  

---

## Week 1: PDPL Compliance Framework

### Day 1-2: Privacy Policy & Terms of Service

**Deliverable:** Privacy Policy (AR + EN) + Terms of Service

```markdown
# PRIVACY POLICY (AR + EN Template)

English Version Location: /web/public/legal/privacy-en.md
Arabic Version Location: /web/public/legal/privacy-ar.md

Critical Sections for PDPL Compliance:

1. DATA COLLECTION
   - What data you collect (emails, phone, profile info, videos, interactions)
   - Legal basis (consent, contractual necessity, legitimate interest)
   - Explicit mention: "You must be 18+ to use D-A-I-R-A"

2. DATA PROCESSING
   - Who processes data (your company, AWS, Cloudflare)
   - Where data is stored (eu-south-1 Milan, with replication strategy)
   - Cross-border transfers (if US parent company involved)
   - Data retention periods (posts kept 90 days after deletion, backups 30 days)

3. USER RIGHTS (PDPL Specific)
   - Right to access (user can download their data)
   - Right to deletion (user can delete account + content)
   - Right to correction (user can update profile)
   - Right to portability (user can export data)
   - Right to object (user can opt out of certain processing)
   - Right to lodge complaint (PDPA office contact info)

4. DATA PROTECTION OFFICER (DPO)
   - Contact: dpo@daira.app
   - Responsibilities: PDPL compliance, breach notification, user requests
   - Process: User can contact DPO for any data questions

5. BREACH NOTIFICATION
   - "We will notify you within 72 hours of discovering unauthorized access"
   - What to expect: Email + SMS with details, mitigation steps, credit monitoring

6. THIRD PARTIES
   - AWS (hosting), Cloudflare (CDN), payment processors, analytics
   - Each third party must have DPA (Data Processing Agreement)

Template Format:
├─ /web/public/legal/privacy-en.md (2,500 words)
├─ /web/public/legal/privacy-ar.md (2,500 words, RTL formatted)
└─ /web/public/legal/privacy-de.md (German for compliance audit)
```

**Implementation Steps:**

1. Use PDPL-compliant template (provided below)
2. Customize sections for D-A-I-R-A specifics
3. Have Egyptian lawyer review (budget: $200-500)
4. Deploy to `/web/public/legal/`
5. Add link in app footer + onboarding flow

**Template Structure (Privacy Policy):**

```markdown
# سياسة الخصوصية | Privacy Policy

**Last Updated:** [Date]
**Effective Date:** [Launch Date]

## لمحة عامة | Overview

D-A-I-R-A ("we," "us," "our") operates a video sharing platform for creators in Egypt.
This Privacy Policy explains how we collect, use, disclose, and otherwise handle your information.

---

### 1. معلومات نجمعها | Information We Collect

#### Personal Information You Provide
- **Account Registration:** Email, phone number, username, profile photo, date of birth
- **Content:** Videos, captions, comments, likes, follows
- **Payment Info:** For creator fund payouts (bank account, tax ID)
- **Communication:** Messages, reports, feedback

#### Information Collected Automatically
- **Device Info:** Device type, OS, app version, unique device ID
- **Usage Data:** Posts viewed, time spent, features used, clicks
- **Location:** Country (approximate, via IP address) - NOT precise GPS
- **Network Info:** ISP, carrier, connection type

#### Cookies & Tracking
- **Functional:** Remember login, preferences, language
- **Analytics:** Track user journeys (for optimization)
- **Marketing:** NOT used for third-party advertising (yet)

---

### 2. كيف نستخدم معلوماتك | How We Use Your Information

| Purpose | Legal Basis | Retention |
|---------|-------------|-----------|
| Provide service | Contractual necessity | While account active |
| Improve platform | Legitimate interest | 12 months |
| Prevent fraud | Legitimate interest | 2 years |
| Comply with law | Legal obligation | As required |
| Process payments | Contractual + Legal | 7 years (tax) |
| Send notifications | Consent | Until opted out |

---

### 3. مع من نشاركها | Who We Share Your Data With

**Mandatory Sharing:**
- Government agencies (PDPA, tax authority, law enforcement) - only with legal order
- Payment processors (Fawry, banks) - for creator payouts
- Cloud providers (AWS, Cloudflare) - for infrastructure

**Optional Sharing:**
- Other users (your profile, public posts) - user control
- Analytics providers (Google Analytics, Mixpanel) - aggregate only
- Marketing partners - ONLY with explicit consent

**NO Selling to Third Parties:** Your data is not for sale.

---

### 4. حقوقك | Your Rights (PDPL Article 23-26)

You have the right to:

| Right | How to Exercise | Timeline |
|------|-----------------|----------|
| **Access** | Settings → Privacy → Download Data | 30 days |
| **Deletion** | Settings → Privacy → Delete Account | 30 days (soft delete, hard after 30d) |
| **Correction** | Edit your profile directly | Immediate |
| **Portability** | Settings → Privacy → Export Data | 30 days (JSON/CSV) |
| **Object** | Email dpo@daira.app with request | 15 days review |
| **Complaint** | File with PDPA (pdpa@daira-complaint.gov.eg) | N/A |

---

### 5. الحماية | Data Security

We implement:
- AES-256 encryption for data at rest
- TLS 1.3 for data in transit
- Regular security audits (quarterly)
- Vulnerability disclosure program
- DPO reviews access logs monthly

What we DON'T do:
- Store passwords (only bcrypt hashes)
- Store payment card details (PCI-DSS compliant third parties only)
- Sell data to advertisers

---

### 6. المدة الزمنية | Data Retention

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| Account data | Until deletion | Provide service |
| Posts | Until deletion + 90 days soft delete | Possible recovery |
| Backups | 30 days | Disaster recovery |
| Logs | 90 days | Security + audit |
| Payment records | 7 years | Tax compliance |
| Deleted posts | 90 days | Legal holds |

After deletion deadline: Cryptographic destruction (not just file deletion).

---

### 7. نقل البيانات | Cross-Border Transfer

Your data is primarily stored in eu-south-1 (Milan, Italy) which ensures GDPR+PDPL compliance.

If you're in Egypt:
- Your data is processed in EU (PDPL Article 31 compliant)
- EU + Egypt have "adequacy" recognition
- We have Standard Contractual Clauses (SCCs) in place with AWS
- You can object to transfers via dpo@daira.app

---

### 8. تحديثات | Changes to This Policy

We may update this policy. Notice will be:
- Sent via email 30 days before
- Posted on app homepage
- Require new consent if material changes

---

### 9. تواصل معنا | Contact Us

| Question Type | Contact | Response Time |
|---------------|---------|----------------|
| **General** | privacy@daira.app | 48 hours |
| **Data Access** | dpo@daira.app | 30 days (legal requirement) |
| **Complaint** | File with PDPA or dpo@daira.app | 15 days |
| **Emergency** | +20 [TBD] | 2 hours |

**Data Protection Officer (DPO):**
```
D-A-I-R-A Egypt LLC
Attn: Data Protection Officer
Cairo, Egypt
dpo@daira.app
```

---

## Signature & Consent

By using D-A-I-R-A, you acknowledge that you have read and understood this Privacy Policy
and agree to our data practices.

Last Updated: [Date]
```

### Day 3: Consent Flows in Registration

**Deliverable:** Consent form component + API endpoints

```typescript
// backend/src/modules/auth/consent.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConsentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Record user consent during registration (PDPL Article 10 compliance)
   * Must explicitly ask for consent before data processing
   */
  async recordRegistrationConsent(
    userId: string,
    consentData: RegistrationConsentDto
  ): Promise<ConsentRecord> {
    // Record EVERY consent decision for audit trail
    return this.prisma.userConsent.create({
      data: {
        userId,
        consentType: 'REGISTRATION',
        timestamp: new Date(),
        ipAddress: consentData.ipAddress,
        userAgent: consentData.userAgent,
        
        // Explicit consent for each processing purpose
        dataProcessingConsent: consentData.dataProcessingConsent, // Required
        marketingEmailConsent: consentData.marketingEmail, // Optional
        analyticsConsent: consentData.analytics, // Optional
        
        // Legal metadata
        policyVersion: '1.0', // Which policy they agreed to
        pdplArticle: '10', // Reference PDPL article
      },
    });
  }

  /**
   * Revoke consent at any time (PDPL Article 23 - right to object)
   */
  async revokeConsent(
    userId: string,
    consentType: 'MARKETING' | 'ANALYTICS' | 'ALL'
  ): Promise<void> {
    if (consentType === 'ALL') {
      // If user revokes all consent, must delete their account
      throw new Error('Revoking all consent requires account deletion');
    }
    
    await this.prisma.userConsent.updateMany({
      where: { userId, consentType },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Verify consent before any processing
   */
  async hasConsent(userId: string, purpose: 'MARKETING' | 'ANALYTICS'): Promise<boolean> {
    const consent = await this.prisma.userConsent.findFirst({
      where: {
        userId,
        consentType: 'REGISTRATION',
        revokedAt: null, // Not revoked
      },
    });

    if (!consent) return false;
    
    if (purpose === 'MARKETING') return consent.marketingEmailConsent;
    if (purpose === 'ANALYTICS') return consent.analyticsConsent;
    
    return false;
  }
}

// Consent Request DTO
export interface RegistrationConsentDto {
  dataProcessingConsent: true; // REQUIRED - can't register without this
  marketingEmail: boolean; // Optional
  analytics: boolean; // Optional
  ipAddress: string; // For audit trail
  userAgent: string; // For audit trail
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  dataProcessingConsent: boolean;
  marketingEmailConsent: boolean;
  analyticsConsent: boolean;
  timestamp: Date;
  revokedAt: Date | null;
  policyVersion: string;
}
```

```typescript
// frontend/src/components/auth/ConsentForm.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export const ConsentForm: React.FC<{ onSubmit: (data: ConsentData) => void }> = ({ onSubmit }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ConsentData>();
  const dataProcessingConsent = watch('dataProcessingConsent');

  return (
    <form onSubmit={handleSubmit(onSubmit)} dir="rtl" lang="ar">
      <fieldset className="border-t pt-6">
        <legend className="text-lg font-bold mb-4">الموافقات المطلوبة</legend>
        
        {/* MANDATORY: Data Processing */}
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('dataProcessingConsent', { required: true })}
              className="mt-1"
              required
            />
            <div>
              <p className="font-semibold">موافقة معالجة البيانات (مطلوبة) *</p>
              <p className="text-sm text-gray-600 mt-1">
                أوافق على معالجة بياناتي وفقاً لسياسة الخصوصية (قانون حماية البيانات الشخصية 151/2020)
              </p>
              <a href="/legal/privacy-ar" target="_blank" className="text-blue-600 text-sm mt-1 block">
                اقرأ سياسة الخصوصية كاملة
              </a>
            </div>
          </label>
          {errors.dataProcessingConsent && (
            <p className="text-red-600 mt-2">يجب الموافقة على معالجة البيانات للمتابعة</p>
          )}
        </div>

        {/* OPTIONAL: Marketing */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('marketingEmail')}
              className="mt-1"
            />
            <div>
              <p className="font-semibold">رسائل التسويق (اختياري)</p>
              <p className="text-sm text-gray-600 mt-1">
                أرغب في تلقي تحديثات وعروض جديدة على البريد الإلكتروني
              </p>
            </div>
          </label>
        </div>

        {/* OPTIONAL: Analytics */}
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('analytics')}
              className="mt-1"
            />
            <div>
              <p className="font-semibold">تحليلات الاستخدام (اختياري)</p>
              <p className="text-sm text-gray-600 mt-1">
                السماح بجمع معلومات مجهولة عن استخدام التطبيق لتحسين الخدمة
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={!dataProcessingConsent}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
      >
        أوافق والمتابعة
      </button>
    </form>
  );
};

interface ConsentData {
  dataProcessingConsent: boolean;
  marketingEmail: boolean;
  analytics: boolean;
}
```

### Day 4: Data Deletion Endpoints

**Deliverable:** PDPL Right-to-Delete implementation

```typescript
// backend/src/modules/privacy/deletion.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DeletionService {
  constructor(
    private prisma: PrismaService,
    private events: EventEmitter2
  ) {}

  /**
   * PDPL Article 23: Right to Deletion (Right to be Forgotten)
   * Must be completed within 30 days
   */
  async requestAccountDeletion(userId: string): Promise<DeletionRequest> {
    // 1. Create deletion request record (audit trail)
    const deletionRequest = await this.prisma.deletionRequest.create({
      data: {
        userId,
        status: 'PENDING', // 30-day grace period
        requestedAt: new Date(),
        scheduledForDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        reason: 'USER_INITIATED',
      },
    });

    // 2. Send confirmation email (user must verify)
    await this.sendDeletionConfirmationEmail(userId);

    // 3. Log for compliance
    await this.logDeletionRequest(userId, deletionRequest.id);

    return deletionRequest;
  }

  /**
   * Execute deletion after 30-day grace period
   * Called by cron job at scheduled time
   */
  async executeAccountDeletion(userId: string): Promise<void> {
    // 1. Anonymize all user data (don't delete immediately)
    await this.anonymizeUserData(userId);

    // 2. Delete sensitive data
    await this.deleteSensitiveData(userId);

    // 3. Hard delete user account
    await this.deleteUserAccount(userId);

    // 4. Archive for legal holds (7 years)
    await this.archiveForLegalHold(userId);

    // 5. Log successful deletion
    await this.logDeletionCompletion(userId);
  }

  /**
   * Anonymize user data while keeping posts (PDPL + Copyright balance)
   */
  private async anonymizeUserData(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@daira-anonymous.internal`,
        phone: null,
        name: 'Deleted User',
        profilePhoto: null,
        bio: null,
        dateOfBirth: null,
        // Keep: posts, likes, follows (for content integrity)
      },
    });
  }

  /**
   * Delete genuinely sensitive data
   */
  private async deleteSensitiveData(userId: string): Promise<void> {
    // Delete payment info
    await this.prisma.paymentMethod.deleteMany({ where: { userId } });

    // Delete sessions/auth tokens
    await this.prisma.authSession.deleteMany({ where: { userId } });

    // Delete DMs (if implemented)
    await this.prisma.directMessage.deleteMany({ where: { senderId: userId } });

    // Delete email addresses from logs
    await this.anonymizeEmailLogs(userId);
  }

  /**
   * Hard delete user account
   */
  private async deleteUserAccount(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  /**
   * Archive for legal holds (government requests, lawsuits)
   * Kept for 7 years (Egyptian tax/compliance requirements)
   */
  private async archiveForLegalHold(userId: string): Promise<void> {
    await this.prisma.deletedUserArchive.create({
      data: {
        userId,
        archivedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000),
        reason: 'LEGAL_HOLD',
      },
    });
  }

  /**
   * Log deletion for audit trail (PDPL compliance)
   */
  private async logDeletionCompletion(userId: string): Promise<void> {
    await this.prisma.complianceLog.create({
      data: {
        userId,
        action: 'ACCOUNT_DELETED',
        timestamp: new Date(),
        pdplArticle: '23',
      },
    });
  }

  private async sendDeletionConfirmationEmail(userId: string): Promise<void> {
    // Implementation: Send email to user
  }

  private async logDeletionRequest(userId: string, requestId: string): Promise<void> {
    // Implementation: Log for audit
  }

  private async anonymizeEmailLogs(userId: string): Promise<void> {
    // Implementation: Remove email from logs
  }
}

// API Endpoint
// POST /api/privacy/request-deletion
export class DeletionController {
  async requestDeletion(@CurrentUser() user: User) {
    return this.deletionService.requestAccountDeletion(user.id);
  }

  // Returns: { id, status: 'PENDING', scheduledForDeletion: Date }
}
```

### Day 5: DPO Appointment Documentation

**Deliverable:** DPO role + responsibilities document

```markdown
# Data Protection Officer (DPO) Appointment - PDPL Compliance

**Effective Date:** [Launch Date]
**PDPL Reference:** Article 17

---

## DPO Role

**Appointed Person:** [Name/Role]
**Title:** Chief Privacy Officer / Data Protection Officer
**Contact:** dpo@daira.app | +20 [Phone]

### Key Responsibilities

| Responsibility | Timeline | Contact |
|---|---|---|
| **Receive Data Subject Requests** (access, deletion, correction) | 30 days | dpo@daira.app |
| **Process PDPA Complaints** | 15 days | File with PDPA |
| **Breach Notification to Authorities** | 72 hours | dpo@daira.app |
| **Privacy Impact Assessments** | Quarterly | Internal |
| **Staff Training** | Annually | Internal |
| **Third-Party DPA Review** | Quarterly | Internal |
| **Audit Compliance** | Quarterly | PDPA |

### PDPL Compliance Checklist (DPO manages)

- [ ] Privacy Policy updated and accessible
- [ ] User consent records maintained
- [ ] Data retention policies enforced
- [ ] Access logs reviewed (monthly)
- [ ] Breach response procedures tested (quarterly)
- [ ] Third-party data processors have DPAs
- [ ] Users can exercise rights (access, deletion, correction)
- [ ] Transparency reports published (annual)

```

---

## Week 1: Content Moderation (Arabic-Aware)

### Day 3-5: Arabic Content Filter

**Deliverable:** Redis Bloom Filter + Keyword List

```typescript
// backend/src/modules/moderation/arabic-filter.ts

import { Injectable } from '@nestjs/common';
import { RedisService } from '@nestjs-modules/ioredis';
import * as BloomFilter from 'bloom-filters';

@Injectable()
export class ArabicContentFilter {
  private bloomFilter: BloomFilter.ScottyBloomFilter;

  constructor(private redis: RedisService) {
    this.initializeFilter();
  }

  private async initializeFilter() {
    // Load Arabic harmful keywords into Bloom Filter (memory efficient)
    const harmfulKeywords = this.loadArabicKeywords();
    
    // Create Bloom Filter (false positive rate: 0.1%)
    this.bloomFilter = BloomFilter.ScottyBloomFilter.from(
      harmfulKeywords,
      0.1
    );
  }

  /**
   * Real-time content check (<10ms target)
   * Three-stage moderation:
   * 1. Fast: Bloom Filter (catches obvious cases)
   * 2. Medium: Detailed rules (catches obscured content)
   * 3. Slow: Human review (catches context-dependent content)
   */
  async moderateContent(content: string, userId: string): Promise<ModerationResult> {
    // Stage 1: Bloom Filter (very fast, <1ms)
    const bloomResult = this.checkBloomFilter(content);

    if (bloomResult.flagged) {
      return {
        decision: 'REVIEW_REQUIRED',
        reason: 'Potential harmful content detected',
        stage: 'BLOOM_FILTER',
        confidenceScore: 0.95,
      };
    }

    // Stage 2: Detailed rules (medium speed, 1-5ms)
    const ruleResult = await this.checkDetailedRules(content);

    if (ruleResult.flagged) {
      return {
        decision: 'REVIEW_REQUIRED',
        reason: ruleResult.reason,
        stage: 'RULE_ENGINE',
        confidenceScore: ruleResult.score,
      };
    }

    // Stage 3: AI classification (slow, 100-500ms) - if confidence low
    if (this.shouldTriggerAIReview(content)) {
      const aiResult = await this.classifyWithAI(content);
      return {
        decision: aiResult.decision,
        reason: aiResult.reason,
        stage: 'AI_CLASSIFIER',
        confidenceScore: aiResult.confidenceScore,
      };
    }

    return {
      decision: 'APPROVED',
      reason: 'Content passed all checks',
      stage: 'ALL_PASSED',
      confidenceScore: 0.99,
    };
  }

  /**
   * Load Arabic harmful keywords
   * Sources: MENAAC (Middle East & North Africa Against Cybercrime)
   */
  private loadArabicKeywords(): string[] {
    return [
      // Hate speech (sectarian)
      'كفار',
      'يهود',
      'أقباط_كفار',
      
      // Violence
      'قتل_الكفار',
      'تفجير',
      'إرهاب',
      
      // Sexual content (non-explicit)
      'جنس',
      'حرام',
      'فاجر',
      
      // Slang variants & Franco-Arabic
      'k3far', // كفار in Franco-Arabic
      'y3hod', // يهود
      '3a7an', // عاهن (prostitute)
      'zane', // زنا (fornication)
      
      // Misspellings (ا vs آ vs إ)
      'اله', // alternate spelling
      'الاه',
      
      // Plus ~5,000 more keywords from moderation research
    ];
  }

  private checkBloomFilter(content: string): { flagged: boolean } {
    const normalized = this.normalizeArabic(content);
    const tokens = this.tokenize(normalized);
    
    for (const token of tokens) {
      if (this.bloomFilter.has(token)) {
        return { flagged: true };
      }
    }
    
    return { flagged: false };
  }

  /**
   * Normalize Arabic text for comparison
   * Handles: diacritics, hamza variations, taa marbuta
   */
  private normalizeArabic(text: string): string {
    return text
      .replace(/[َُِّّ]/g, '') // Remove diacritics
      .replace(/[أإآ]/g, 'ا') // Normalize alif variations
      .replace(/ة/g, 'ه') // Taa marbuta to haa
      .replace(/ى/g, 'ي') // Alif maksura to yaa
      .toLowerCase();
  }

  private tokenize(text: string): string[] {
    // Simple split; could use advanced tokenizer
    return text.split(/\s+/);
  }

  private async checkDetailedRules(content: string): Promise<{ flagged: boolean; reason?: string; score?: number }> {
    // Check for patterns:
    // 1. Repeated characters: "كككك" (emphasis)
    // 2. Multiple exclamations: "!!!!!!"
    // 3. URL patterns (spam)
    
    if (/(\w)\1{4,}/.test(content)) {
      return { flagged: true, reason: 'Repeated characters (spam)', score: 0.6 };
    }
    
    if (/!{3,}|؟{3,}/.test(content)) {
      return { flagged: true, reason: 'Multiple punctuation (spam)', score: 0.5 };
    }
    
    return { flagged: false };
  }

  private shouldTriggerAIReview(content: string): boolean {
    // Trigger AI if text is ambiguous (length, complexity)
    return content.length > 100 && content.includes('الله');
  }

  private async classifyWithAI(content: string): Promise<{
    decision: 'APPROVED' | 'REVIEW_REQUIRED' | 'REMOVED';
    reason: string;
    confidenceScore: number;
  }> {
    // Call to MarBERT or similar Arabic NLP model
    // For now: placeholder
    return {
      decision: 'REVIEW_REQUIRED',
      reason: 'AI review needed (MarBERT)',
      confidenceScore: 0.7,
    };
  }
}

export interface ModerationResult {
  decision: 'APPROVED' | 'REVIEW_REQUIRED' | 'REMOVED';
  reason: string;
  stage: 'BLOOM_FILTER' | 'RULE_ENGINE' | 'AI_CLASSIFIER' | 'ALL_PASSED';
  confidenceScore: number; // 0-1
}
```

### Day 5-7: User Reporting & Admin Queue

**Deliverable:** Reporting UI + Admin moderation dashboard

```typescript
// backend/src/modules/moderation/report.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  /**
   * User reports content (Arabic UI)
   */
  async reportContent(
    reporterUserId: string,
    reportData: CreateReportDto
  ): Promise<ContentReport> {
    // Validate report is legitimate (not spam)
    const recentReports = await this.prisma.contentReport.count({
      where: {
        reporterUserId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (recentReports > 50) {
      throw new Error('Too many reports in 24 hours');
    }

    // Create report
    const report = await this.prisma.contentReport.create({
      data: {
        reporterUserId,
        postId: reportData.postId,
        reason: reportData.reason, // HARASSMENT | SEXUAL | SPAM | HATE_SPEECH | etc
        description: reportData.description,
        status: 'PENDING',
        priority: this.calculatePriority(reportData.reason),
      },
    });

    // Notify admins
    await this.notifyAdmins(report);

    return report;
  }

  private calculatePriority(reason: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const highPriority = ['HATE_SPEECH', 'VIOLENCE', 'SEXUAL_CONTENT'];
    if (highPriority.includes(reason)) return 'HIGH';
    
    const mediumPriority = ['HARASSMENT', 'MISINFORMATION'];
    if (mediumPriority.includes(reason)) return 'MEDIUM';
    
    return 'LOW';
  }

  private async notifyAdmins(report: ContentReport): Promise<void> {
    // Notify via email + in-app notification
  }
}

// Admin Dashboard Endpoint
export class ModerationController {
  constructor(private reportService: ReportService) {}

  @Get('/admin/reports/queue')
  async getReportsQueue(@CurrentUser() admin: User) {
    // Return reports pending review, ordered by priority
    return this.prisma.contentReport.findMany({
      where: { status: 'PENDING' },
      orderBy: { priority: 'desc' },
      take: 20,
    });
  }

  @Post('/admin/reports/:id/decision')
  async reviewReport(
    @Param('id') reportId: string,
    @Body() decision: ReviewDecisionDto,
    @CurrentUser() admin: User
  ) {
    // Admin decision: APPROVED | REMOVE_POST | BAN_USER
    await this.executeReviewDecision(reportId, decision, admin.id);
  }
}
```

---

## Week 2: Government Relations Setup

### Day 1-3: Egyptian LLC Formation Checklist

**Deliverable:** Legal entity formation checklist

```markdown
# Egyptian LLC Formation Checklist (Timeline: 6-8 weeks)

## Phase 1: Preparation (Week 1)

- [ ] Hire Egyptian lawyer (specializing in tech/media)
  - Budget: $500-1000 for LLC formation
  - Contact: [Firm name to be added]

- [ ] Decide on LLC structure
  - 100% foreign ownership OR
  - Joint venture with Egyptian partner (51% local minimum)

- [ ] Prepare documents
  - Shareholder info (name, passport, address, nationality)
  - Company name: "D-A-I-R-A Egypt LLC" (or variations)
  - Company purpose: "Digital media platform, content distribution"
  - Capital: 100,000 EGP (~$2,000)
  - Directors (your names + titles)

## Phase 2: Government Registration (Weeks 2-6)

- [ ] Commercial Registry Registration
  - Location: Dar Al-Mahfuzat (Government Records Authority)
  - Documents: Articles of Association, shareholder docs
  - Timeline: 2-3 weeks
  - Cost: ~200 EGP

- [ ] Tax Registration (Unique Tax Number)
  - Location: Tax Authority
  - Documents: Commercial registry certificate
  - Timeline: 1 week
  - Cost: ~100 EGP
  - Outcome: Unique tax number for VAT/withholding

- [ ] Social Insurance Registration
  - Required if hiring employees
  - Timeline: 1-2 weeks
  - Cost: ~500 EGP

- [ ] Banking Account Setup
  - Bank: Any Egyptian bank (CIB, Banque du Caire, ADIB)
  - Documents: Articles of Association + tax certificate
  - Timeline: 1 week
  - Cost: ~200 EGP

- [ ] Address Registration
  - Virtual office: Regus/WeWork (if needed)
  - Or real office address
  - Required for: Commercial registry, bank account

## Phase 3: Post-Formation (Weeks 7-8)

- [ ] Annual General Meeting (AGM) documentation
  - Required before operations start
  - Minutes + resolutions

- [ ] VAT Registration (if applicable)
  - Revenue threshold: 500,000 EGP annual
  - Timeline: 1 week
  - Cost: Included in tax registration

- [ ] E-Payment License (if handling payments)
  - Required by CBE (Central Bank of Egypt)
  - Complex; may require partnership with established payment processor

- [ ] NTRA Notification
  - Inform telecom regulator of platform existence
  - May require approval (unclear if mandatory for app-based)
  - Timeline: TBD

## Ongoing Compliance

- [ ] Annual Financial Audit
  - Timeline: By June 30 each year
  - Cost: ~1,000-2,000 EGP

- [ ] Tax Return Filing
  - Timeline: By June 30 each year
  - Cost: Included with accountant retainer

- [ ] Quarterly VAT Filing
  - If revenue >500K EGP
  - Timeline: By 20th of next month

- [ ] Social Insurance Contributions
  - If employees hired
  - Timeline: Monthly

## Total Cost Estimate

| Item | Cost |
|------|------|
| Lawyer (LLC formation) | $500-1,000 |
| Government registrations | ~200 EGP |
| Bank account | ~200 EGP |
| Accountant (annual audit) | ~1,000-2,000 EGP |
| **First Year Total** | ~$600-1,200 + accountant |

## Timeline

```
Week 1: Hire lawyer, prepare documents
Week 2-3: Commercial registry
Week 3-4: Tax registration + bank account
Week 4-5: Social insurance (if hiring)
Week 6-7: VAT registration + NTRA notification
Week 7-8: AGM + post-formation compliance
```

**Outcome:** D-A-I-R-A Egypt LLC, fully legal, ready to operate
```

### Day 4-5: Government Liaison Hiring

**Deliverable:** Fixer job description + hiring guide

```markdown
# Government Liaison / "Fixer" Job Description

**Title:** Government Relations Manager / Egyptian Fixer
**Reports To:** CEO
**Location:** Cairo, Egypt
**Salary:** $2,000-5,000/month

## Responsibilities

1. **Government Relationship Building**
   - Establish contacts at NTRA (National Telecommunications Regulatory Authority)
   - Build relationships with CBE (Central Bank of Egypt)
   - Maintain liaison with PDPA (Personal Data Protection Authority)
   - Attend industry meetings/conferences

2. **Content Takedown Requests**
   - Receive and review government content removal requests
   - Assess legality of requests
   - Negotiate scope (remove specific post vs. entire account)
   - Ensure 24-48 hour response SLA
   - Document all requests

3. **Regulatory Monitoring**
   - Track new telecommunications/data protection regulations
   - Alert CEO to changes that affect D-A-I-R-A
   - Advise on compliance strategies

4. **Crisis Management**
   - If platform threatened with blocking, negotiate
   - Advise on government pressure response
   - Connect with legal counsel

5. **Transparency Reporting**
   - Help prepare quarterly government request reports
   - Track removals by category + reason

## Required Experience

- ✅ 5+ years experience in Egyptian government relations
- ✅ Worked with telecom/media/tech companies
- ✅ Fluent Arabic + English
- ✅ Personal connections to NTRA/CBE (critical)
- ✅ Understanding of Egyptian business culture + formal processes
- ✅ Crisis management experience

## Hiring Process

1. **References:** Get 3+ tech company references who've hired fixers
2. **Interview:** Face-to-face in Cairo (if possible) or video
3. **Background check:** Verify government connections
4. **Trial period:** Start with 3 consulting engagements before full hire
5. **Expectations:** Clear SLA (respond to government within 4 hours)

## Where to Find

- LinkedIn: Search "Egypt government relations" + filter by Cairo
- Referrals: Ask other tech companies (likely have recommendations)
- Recruitment firms: Talentville, Link Recruit, Giza Systems (Egyptian recruiters)

```

---

## Deliverables Summary (Track 1, Week 1-2)

| Week | Day | Deliverable | Status |
|-----|-----|-------------|--------|
| 1 | 1-2 | Privacy Policy (AR+EN) + ToS | Template ✅ |
| 1 | 3 | Consent flows (backend + frontend) | Code ✅ |
| 1 | 4 | Data deletion endpoints (PDPL Art. 23) | Code ✅ |
| 1 | 5 | DPO appointment documentation | Doc ✅ |
| 1 | 3-7 | Arabic content moderation (Bloom Filter) | Code ✅ |
| 1 | 5-7 | User reporting + admin queue | Code ✅ |
| 2 | 1-3 | Egyptian LLC formation checklist | Doc ✅ |
| 2 | 4-5 | Government liaison job description | Doc ✅ |

**Time to Complete:** 10-14 days (with parallelization)
**Team Size:** 1-2 people (1 backend dev, 1 ops/legal)
**Cost:** $500-1,000 (legal review; templates provided)
**Outcome:** Legally operational, content moderation live, government relations initiated

---

## Next Steps

1. **Day 1:** Deploy privacy policy + consent forms
2. **Day 3:** Enable content moderation in user reporting
3. **Day 7:** Submit LLC formation documents to lawyer
4. **Day 10:** Begin government liaison interviews

## Files to Create in Repo

```
backend/src/modules/auth/consent.service.ts
backend/src/modules/privacy/deletion.service.ts
backend/src/modules/moderation/arabic-filter.ts
backend/src/modules/moderation/report.service.ts
web/public/legal/privacy-en.md
web/public/legal/privacy-ar.md
web/public/legal/terms-en.md
web/public/legal/terms-ar.md
docs/LLC_FORMATION_CHECKLIST.md
docs/GOVERNMENT_LIAISON_JOB_DESC.md
```
