/**
 * Content Planning Service
 * VAL-DEPT-SOCIAL-001: Content planning produces reviewed channel-specific briefs
 * 
 * Creates channel-specific content briefs with experiment hypotheses,
 * routes them through safety and fit review, and preserves explicit
 * approval steps before publish-adjacent actions.
 */

import type {
  ContentBrief,
  ContentBriefReview,
  ContentBriefApproval,
  ContentBriefWorkflowState,
  SocialChannel,
  ContentFormat,
  ContentGoal,
  ExperimentHypothesis,
  ChannelConfig,
  CreateBriefParams,
  SubmitForReviewParams,
  ReviewBriefParams,
  ApproveBriefParams,
  PublishBriefParams,
  BriefStatus,
  ReviewDecision,
  ApprovalDecision,
} from "./types.js";

// Channel configurations
const CHANNEL_CONFIGS: Record<SocialChannel, ChannelConfig> = {
  x: {
    channel: "x",
    displayName: "X (Twitter)",
    contentFormats: ["text", "image", "video"],
    maxCaptionLength: 280,
    hashtagLimit: 10,
    mediaRequirements: {
      imageMinWidth: 600,
      imageMinHeight: 335,
    },
    moderationRules: ["no-hate-speech", "no-harassment", "no-misinformation"],
  },
  instagram: {
    channel: "instagram",
    displayName: "Instagram",
    contentFormats: ["image", "video", "carousel", "story", "reel"],
    maxCaptionLength: 2200,
    hashtagLimit: 30,
    mediaRequirements: {
      imageMinWidth: 1080,
      imageMinHeight: 1080,
      videoMinDuration: 3,
      videoMaxDuration: 60,
    },
    moderationRules: ["no-adult-content", "no-hate-speech", "no-bullying"],
  },
  youtube: {
    channel: "youtube",
    displayName: "YouTube",
    contentFormats: ["video"],
    maxCaptionLength: 5000,
    hashtagLimit: 15,
    mediaRequirements: {
      videoMinDuration: 60,
    },
    moderationRules: ["no-clickbait", "no-misleading-content", "no-copyright-violation"],
  },
  tiktok: {
    channel: "tiktok",
    displayName: "TikTok",
    contentFormats: ["video"],
    maxCaptionLength: 150,
    hashtagLimit: 10,
    mediaRequirements: {
      videoMinDuration: 3,
      videoMaxDuration: 180,
    },
    moderationRules: ["no-adult-content", "no-violent-content", "no-misinformation"],
  },
  facebook: {
    channel: "facebook",
    displayName: "Facebook",
    contentFormats: ["text", "image", "video", "carousel", "link"],
    maxCaptionLength: 63206,
    hashtagLimit: 10,
    mediaRequirements: {
      imageMinWidth: 1200,
      imageMinHeight: 630,
    },
    moderationRules: ["no-hate-speech", "no-misinformation", "no-spam"],
  },
  linkedin: {
    channel: "linkedin",
    displayName: "LinkedIn",
    contentFormats: ["text", "image", "video", "carousel"],
    maxCaptionLength: 3000,
    hashtagLimit: 5,
    mediaRequirements: {
      imageMinWidth: 1200,
      imageMinHeight: 627,
    },
    moderationRules: ["no-professional-misconduct", "no-spam", "no-misleading-content"],
  },
  reddit: {
    channel: "reddit",
    displayName: "Reddit",
    contentFormats: ["text", "link"],
    maxCaptionLength: 40000,
    hashtagLimit: 20,
    mediaRequirements: {},
    moderationRules: ["no-self-promotion", "no-spam", "no-brigading"],
  },
  blog: {
    channel: "blog",
    displayName: "Blog / SEO",
    contentFormats: ["text", "image"],
    maxCaptionLength: 10000,
    hashtagLimit: 10,
    mediaRequirements: {
      imageMinWidth: 1200,
    },
    moderationRules: ["no-plagiarism", "no-keyword-stuffing", "no-thin-content"],
  },
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export class ContentPlanningService {
  private state: ContentBriefWorkflowState;

  constructor(initialState?: ContentBriefWorkflowState) {
    this.state = initialState ?? {
      briefs: {},
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get the channel configuration for a specific channel
   */
  getChannelConfig(channel: SocialChannel): ChannelConfig {
    return CHANNEL_CONFIGS[channel];
  }

  /**
   * Get all supported channels
   */
  getSupportedChannels(): SocialChannel[] {
    return Object.keys(CHANNEL_CONFIGS) as SocialChannel[];
  }

  /**
   * Create a new content brief
   * VAL-DEPT-SOCIAL-001
   */
  createBrief(params: CreateBriefParams): ContentBrief {
    const now = new Date().toISOString();
    
    const experimentHypothesis: ExperimentHypothesis | undefined = params.experimentHypothesis
      ? {
          id: generateId(),
          hypothesis: params.experimentHypothesis.hypothesis,
          successMetric: params.experimentHypothesis.successMetric,
          targetChange: params.experimentHypothesis.targetChange,
          controlGroup: params.experimentHypothesis.controlGroup,
          confidenceLevel: params.experimentHypothesis.confidenceLevel ?? "medium",
          createdAt: now,
        }
      : undefined;

    const brief: ContentBrief = {
      id: generateId(),
      title: params.title,
      description: params.description,
      channel: params.channel,
      contentFormat: params.contentFormat,
      campaignId: params.campaignId,
      campaignName: params.campaignName,
      linkedInitiatives: params.linkedInitiatives ?? [],
      linkedProjects: params.linkedProjects ?? [],
      topic: params.topic,
      keyMessages: params.keyMessages ?? [],
      targetAudience: params.targetAudience,
      hashtags: params.hashtags ?? [],
      contentGoals: params.contentGoals,
      experimentHypothesis,
      status: "draft",
      reviews: [],
      approvals: [],
      scheduledPublishDate: params.scheduledPublishDate,
      createdByRoleKey: params.createdByRoleKey,
      createdAt: now,
      updatedAt: now,
      tags: params.tags ?? [],
      assetUrls: params.assetUrls ?? [],
      draftContent: undefined,
    };

    this.state.briefs[brief.id] = brief;
    this.state.lastUpdated = now;
    return brief;
  }

  /**
   * Get a brief by ID
   */
  getBrief(briefId: string): ContentBrief | undefined {
    return this.state.briefs[briefId];
  }

  /**
   * Get all briefs
   */
  getAllBriefs(): ContentBrief[] {
    return Object.values(this.state.briefs);
  }

  /**
   * Get briefs by status
   */
  getBriefsByStatus(status: BriefStatus): ContentBrief[] {
    return Object.values(this.state.briefs).filter((b) => b.status === status);
  }

  /**
   * Get briefs by channel
   */
  getBriefsByChannel(channel: SocialChannel): ContentBrief[] {
    return Object.values(this.state.briefs).filter((b) => b.channel === channel);
  }

  /**
   * Get briefs pending review
   */
  getPendingReviewBriefs(): ContentBrief[] {
    return Object.values(this.state.briefs).filter((b) => b.status === "pending-review");
  }

  /**
   * Get briefs pending approval
   */
  getPendingApprovalBriefs(): ContentBrief[] {
    return Object.values(this.state.briefs).filter((b) => b.status === "pending-approval");
  }

  /**
   * Get briefs for a specific campaign
   */
  getBriefsByCampaign(campaignId: string): ContentBrief[] {
    return Object.values(this.state.briefs).filter((b) => b.campaignId === campaignId);
  }

  /**
   * Update brief content
   */
  updateBrief(
    briefId: string,
    updates: Partial<Pick<ContentBrief, "title" | "description" | "topic" | "keyMessages" | "targetAudience" | "hashtags" | "contentGoals" | "draftContent" | "scheduledPublishDate" | "tags" | "assetUrls">>
  ): ContentBrief | undefined {
    const brief = this.state.briefs[briefId];
    if (!brief) return undefined;

    // Can only update draft briefs
    if (brief.status !== "draft") {
      return undefined;
    }

    const now = new Date().toISOString();
    Object.assign(brief, updates, { updatedAt: now });
    this.state.lastUpdated = now;
    return brief;
  }

  /**
   * Submit a brief for review
   * VAL-DEPT-SOCIAL-001
   */
  submitForReview(params: SubmitForReviewParams): ContentBrief | undefined {
    const brief = this.state.briefs[params.briefId];
    if (!brief) return undefined;

    // Can only submit draft briefs for review
    if (brief.status !== "draft") {
      return undefined;
    }

    // Validate required fields before submission
    if (!brief.topic || !brief.targetAudience || brief.contentGoals.length === 0) {
      return undefined;
    }

    const now = new Date().toISOString();
    brief.status = "pending-review";
    brief.updatedAt = now;
    this.state.lastUpdated = now;
    return brief;
  }

  /**
   * Review a brief
   * VAL-DEPT-SOCIAL-001
   */
  reviewBrief(params: ReviewBriefParams): ContentBrief | undefined {
    const brief = this.state.briefs[params.briefId];
    if (!brief) return undefined;

    // Can only review briefs pending review
    if (brief.status !== "pending-review") {
      return undefined;
    }

    const now = new Date().toISOString();

    const review: ContentBriefReview = {
      id: generateId(),
      briefId: params.briefId,
      reviewerRoleKey: params.reviewerRoleKey,
      reviewedAt: now,
      decision: params.decision,
      brandSafetyCheck: {
        passed: params.brandSafetyCheck.passed,
        flags: params.brandSafetyCheck.flags ?? [],
        notes: params.brandSafetyCheck.notes,
      },
      channelFitCheck: {
        passed: params.channelFitCheck.passed,
        flags: params.channelFitCheck.flags ?? [],
        notes: params.channelFitCheck.notes,
      },
      contentQualityCheck: {
        passed: params.contentQualityCheck.passed,
        flags: params.contentQualityCheck.flags ?? [],
        notes: params.contentQualityCheck.notes,
      },
      feedback: params.feedback ?? "",
    };

    brief.reviews.push(review);

    // If rejected, mark brief as rejected
    if (params.decision === "rejected") {
      brief.status = "rejected";
    } else if (params.decision === "revision-requested") {
      brief.status = "draft"; // Send back for revision
    } else if (params.decision === "approved") {
      // Check if all reviews are approved - then move to approval
      brief.status = "pending-approval";
    }

    brief.updatedAt = now;
    this.state.lastUpdated = now;
    return brief;
  }

  /**
   * Approve a brief
   * VAL-DEPT-SOCIAL-001
   */
  approveBrief(params: ApproveBriefParams): ContentBrief | undefined {
    const brief = this.state.briefs[params.briefId];
    if (!brief) return undefined;

    // Can only approve briefs pending approval
    if (brief.status !== "pending-approval") {
      return undefined;
    }

    const now = new Date().toISOString();

    const approval: ContentBriefApproval = {
      id: generateId(),
      briefId: params.briefId,
      approverRoleKey: params.approverRoleKey,
      approvedAt: now,
      decision: params.decision,
      conditions: params.conditions,
      feedback: params.feedback ?? "",
    };

    brief.approvals.push(approval);

    if (params.decision === "approved") {
      brief.status = "approved";
    } else if (params.decision === "rejected") {
      brief.status = "rejected";
    } else if (params.decision === "conditional") {
      brief.status = "approved"; // Still approved but with conditions noted
    }

    brief.updatedAt = now;
    this.state.lastUpdated = now;
    return brief;
  }

  /**
   * Publish a brief
   * VAL-DEPT-SOCIAL-001
   */
  publishBrief(params: PublishBriefParams): ContentBrief | undefined {
    const brief = this.state.briefs[params.briefId];
    if (!brief) return undefined;

    // Can only publish approved briefs
    if (brief.status !== "approved") {
      return undefined;
    }

    const now = new Date().toISOString();
    brief.status = "published";
    brief.draftContent = params.draftContent;
    brief.publishedAt = params.publishedAt ?? now;
    brief.updatedAt = now;
    this.state.lastUpdated = now;
    return brief;
  }

  /**
   * Archive a brief
   */
  archiveBrief(briefId: string): ContentBrief | undefined {
    const brief = this.state.briefs[briefId];
    if (!brief) return undefined;

    // Can only archive published or rejected briefs
    if (!["published", "rejected"].includes(brief.status)) {
      return undefined;
    }

    const now = new Date().toISOString();
    brief.status = "archived";
    brief.updatedAt = now;
    this.state.lastUpdated = now;
    return brief;
  }

  /**
   * Get review summary for a brief
   */
  getReviewSummary(briefId: string): {
    totalReviews: number;
    approved: number;
    rejected: number;
    revisionRequested: number;
    allBrandSafetyPassed: boolean;
    allChannelFitPassed: boolean;
    allQualityPassed: boolean;
  } | undefined {
    const brief = this.state.briefs[briefId];
    if (!brief) return undefined;

    const reviews = brief.reviews;
    return {
      totalReviews: reviews.length,
      approved: reviews.filter((r) => r.decision === "approved").length,
      rejected: reviews.filter((r) => r.decision === "rejected").length,
      revisionRequested: reviews.filter((r) => r.decision === "revision-requested").length,
      allBrandSafetyPassed: reviews.every((r) => r.brandSafetyCheck.passed),
      allChannelFitPassed: reviews.every((r) => r.channelFitCheck.passed),
      allQualityPassed: reviews.every((r) => r.contentQualityCheck.passed),
    };
  }

  /**
   * Get approval summary for a brief
   */
  getApprovalSummary(briefId: string): {
    totalApprovals: number;
    approved: number;
    rejected: number;
    conditional: number;
  } | undefined {
    const brief = this.state.briefs[briefId];
    if (!brief) return undefined;

    const approvals = brief.approvals;
    return {
      totalApprovals: approvals.length,
      approved: approvals.filter((a) => a.decision === "approved").length,
      rejected: approvals.filter((a) => a.decision === "rejected").length,
      conditional: approvals.filter((a) => a.decision === "conditional").length,
    };
  }

  /**
   * Generate brief summary
   */
  generateSummary(): {
    totalBriefs: number;
    byStatus: Record<BriefStatus, number>;
    byChannel: Record<SocialChannel, number>;
    pendingReview: number;
    pendingApproval: number;
    approved: number;
    published: number;
  } {
    const briefs = Object.values(this.state.briefs);

    const byStatus: Record<BriefStatus, number> = {
      draft: 0,
      "pending-review": 0,
      "pending-approval": 0,
      approved: 0,
      rejected: 0,
      published: 0,
      archived: 0,
    };

    const byChannel: Record<SocialChannel, number> = {
      x: 0,
      instagram: 0,
      youtube: 0,
      tiktok: 0,
      facebook: 0,
      linkedin: 0,
      reddit: 0,
      blog: 0,
    };

    for (const brief of briefs) {
      byStatus[brief.status]++;
      byChannel[brief.channel]++;
    }

    return {
      totalBriefs: briefs.length,
      byStatus,
      byChannel,
      pendingReview: briefs.filter((b) => b.status === "pending-review").length,
      pendingApproval: briefs.filter((b) => b.status === "pending-approval").length,
      approved: briefs.filter((b) => b.status === "approved").length,
      published: briefs.filter((b) => b.status === "published").length,
    };
  }

  /**
   * Get current state for persistence
   */
  getState(): ContentBriefWorkflowState {
    return this.state;
  }

  /**
   * Load state from persistence
   */
  loadState(state: ContentBriefWorkflowState): void {
    this.state = state;
  }
}
