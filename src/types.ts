/**
 * Social Media Department Types
 * VAL-DEPT-SOCIAL-001: Content planning produces reviewed channel-specific briefs
 * VAL-DEPT-SOCIAL-002: Performance analysis creates reusable patterns and escalation paths
 */

// ============================================
// Channel and Platform Types
// ============================================

export type SocialChannel = "x" | "instagram" | "youtube" | "tiktok" | "facebook" | "linkedin" | "reddit" | "blog";
export type ContentFormat = "text" | "image" | "video" | "carousel" | "story" | "reel" | "live" | "thread" | "link";
export type ContentGoal = "awareness" | "engagement" | "conversion" | "traffic" | "brand" | "community";

export interface ChannelConfig {
  channel: SocialChannel;
  displayName: string;
  contentFormats: ContentFormat[];
  maxCaptionLength: number;
  hashtagLimit: number;
  mediaRequirements: {
    imageMinWidth?: number;
    imageMinHeight?: number;
    videoMinDuration?: number;
    videoMaxDuration?: number;
  };
  moderationRules: string[];
}

// ============================================
// Content Brief Types (VAL-DEPT-SOCIAL-001)
// ============================================

export type BriefStatus = "draft" | "pending-review" | "pending-approval" | "approved" | "rejected" | "published" | "archived";
export type ReviewDecision = "approved" | "rejected" | "revision-requested";
export type ApprovalDecision = "approved" | "rejected" | "conditional";

export interface ExperimentHypothesis {
  id: string;
  hypothesis: string; // e.g., "Posts with images will get 2x engagement"
  successMetric: string;
  targetChange: number; // e.g., 0.5 for 50% improvement
  controlGroup?: string;
  confidenceLevel: "high" | "medium" | "low";
  createdAt: string;
}

export interface ContentBriefReview {
  id: string;
  briefId: string;
  reviewerRoleKey: string;
  reviewedAt: string;
  decision: ReviewDecision;
  brandSafetyCheck: {
    passed: boolean;
    flags: string[];
    notes?: string;
  };
  channelFitCheck: {
    passed: boolean;
    flags: string[];
    notes?: string;
  };
  contentQualityCheck: {
    passed: boolean;
    flags: string[];
    notes?: string;
  };
  feedback: string;
}

export interface ContentBriefApproval {
  id: string;
  briefId: string;
  approverRoleKey: string;
  approvedAt: string;
  decision: ApprovalDecision;
  conditions?: string[];
  feedback: string;
}

export interface ContentBrief {
  id: string;
  title: string;
  description: string;
  
  // Channel-specific configuration
  channel: SocialChannel;
  contentFormat: ContentFormat;
  
  // Campaign context
  campaignId?: string;
  campaignName?: string;
  linkedInitiatives: string[];
  linkedProjects: string[];
  
  // Content details
  topic: string;
  keyMessages: string[];
  targetAudience: string;
  hashtags: string[];
  contentGoals: ContentGoal[];
  
  // Experiment hypothesis
  experimentHypothesis?: ExperimentHypothesis;
  
  // Review and approval state
  status: BriefStatus;
  reviews: ContentBriefReview[];
  approvals: ContentBriefApproval[];
  
  // Timing
  scheduledPublishDate?: string;
  actualPublishDate?: string;
  
  // Metadata
  createdByRoleKey: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  
  // Tags and assets
  tags: string[];
  assetUrls: string[];
  draftContent?: string;
}

// ============================================
// Performance Analysis Types (VAL-DEPT-SOCIAL-002)
// ============================================

export type PerformanceMetricType = "impressions" | "reach" | "engagement" | "clicks" | "shares" | "comments" | "likes" | "followers" | "conversions" | "revenue";

export interface PerformanceMetric {
  type: PerformanceMetricType;
  value: number;
  previousValue?: number;
  changePercent?: number;
  isPositiveChange: boolean;
}

export interface ChannelPerformance {
  channel: SocialChannel;
  briefId: string;
  publishedAt: string;
  
  // Performance metrics
  metrics: PerformanceMetric[];
  
  // Goal alignment
  goalAchievement: {
    goal: ContentGoal;
    achieved: boolean;
    details: string;
  }[];
  
  // Hypothesis validation
  hypothesisOutcome?: {
    hypothesisId: string;
    validated: boolean;
    actualChange: number;
    analysis: string;
  };
  
  // Overall assessment
  overallScore: number; // 0-100
  topPerformingContent?: string;
  underperformingContent?: string;
}

export type PatternConfidence = "high" | "medium" | "low";
export type PatternStatus = "discovered" | "validating" | "validated" | "archived";

export interface ReusablePattern {
  id: string;
  patternKey: string;
  title: string;
  description: string;
  
  // Pattern classification
  patternType: "timing" | "format" | "topic" | "hashtag" | "audience" | "creative" | "cta" | "multi-channel";
  confidence: PatternConfidence;
  successRate: number; // percentage
  
  // Evidence
  evidenceBriefIds: string[];
  supportingMetrics: {
    metric: PerformanceMetricType;
    averageLift: number; // e.g., 0.3 for 30% improvement
    sampleSize: number;
  }[];
  
  // When to use
  recommendedFor: {
    channels: SocialChannel[];
    contentGoals: ContentGoal[];
  };
  
  // Status
  status: PatternStatus;
  firstIdentifiedAt: string;
  lastValidatedAt: string;
  validatedCount: number;
}

export type EscalationTrigger = 
  | "platform-policy-change"
  | "moderation-spike"
  | "audience-sentiment-negative"
  | "competitor-action"
  | "viral-negative"
  | "brand-safety-risk"
  | "performance-degradation";

export type EscalationSeverity = "low" | "medium" | "high" | "critical";
export type EscalationStatus = "triggered" | "investigating" | "mitigating" | "resolved" | "dismissed";

export interface EscalationPath {
  id: string;
  trigger: EscalationTrigger;
  severity: EscalationSeverity;
  status: EscalationStatus;
  
  // What happened
  description: string;
  affectedBriefIds: string[];
  affectedChannels: SocialChannel[];
  
  // Timeline
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  
  // Response
  assignedRoleKey?: string;
  responseActions: string[];
  mitigationNotes: string[];
  
  // Risk assessment
  brandRiskLevel: EscalationSeverity;
  operationalRiskLevel: EscalationSeverity;
  
  // Follow-up
  followUpPatternId?: string;
  followUpActionIds: string[];
}

// ============================================
// Workflow State Types
// ============================================

export interface ContentBriefWorkflowState {
  briefs: Record<string, ContentBrief>;
  lastUpdated: string;
}

export interface PerformanceWorkflowState {
  performances: Record<string, ChannelPerformance>; // briefId -> performance
  patterns: Record<string, ReusablePattern>;
  escalations: Record<string, EscalationPath>;
  lastUpdated: string;
}

// ============================================
// Action Parameters
// ============================================

// Content Brief Parameters
export interface CreateBriefParams {
  title: string;
  description: string;
  channel: SocialChannel;
  contentFormat: ContentFormat;
  campaignId?: string;
  campaignName?: string;
  linkedInitiatives?: string[];
  linkedProjects?: string[];
  topic: string;
  keyMessages?: string[];
  targetAudience: string;
  hashtags?: string[];
  contentGoals: ContentGoal[];
  experimentHypothesis?: Omit<ExperimentHypothesis, "id" | "createdAt">;
  createdByRoleKey: string;
  scheduledPublishDate?: string;
  tags?: string[];
  assetUrls?: string[];
}

export interface SubmitForReviewParams {
  briefId: string;
  reviewerRoleKey: string;
}

export interface ReviewBriefParams {
  briefId: string;
  reviewerRoleKey: string;
  brandSafetyCheck: {
    passed: boolean;
    flags?: string[];
    notes?: string;
  };
  channelFitCheck: {
    passed: boolean;
    flags?: string[];
    notes?: string;
  };
  contentQualityCheck: {
    passed: boolean;
    flags?: string[];
    notes?: string;
  };
  decision: ReviewDecision;
  feedback?: string;
}

export interface ApproveBriefParams {
  briefId: string;
  approverRoleKey: string;
  decision: ApprovalDecision;
  conditions?: string[];
  feedback?: string;
}

export interface PublishBriefParams {
  briefId: string;
  draftContent: string;
  publishedAt?: string;
}

export interface AnalyzePerformanceParams {
  briefId: string;
  metrics: PerformanceMetric[];
  goalAchievement?: {
    goal: ContentGoal;
    achieved: boolean;
    details: string;
  }[];
}

export interface ExtractPatternParams {
  patternKey: string;
  title: string;
  description: string;
  patternType: ReusablePattern["patternType"];
  evidenceBriefIds: string[];
  recommendedFor: {
    channels?: SocialChannel[];
    contentGoals?: ContentGoal[];
  };
}

export interface CreateEscalationParams {
  trigger: EscalationTrigger;
  severity: EscalationSeverity;
  description: string;
  affectedBriefIds?: string[];
  affectedChannels?: SocialChannel[];
  assignedRoleKey?: string;
}

export interface UpdateEscalationStatusParams {
  escalationId: string;
  status: EscalationStatus;
  responseActions?: string[];
  mitigationNotes?: string[];
}
