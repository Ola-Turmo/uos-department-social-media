/**
 * Performance Analysis Service
 * VAL-DEPT-SOCIAL-002: Performance analysis creates reusable patterns and escalation paths
 * 
 * Analyzes post performance against hypotheses, extracts reusable patterns
 * for future briefs, and supports escalation when platform or moderation
 * shifts create risk.
 */

import type {
  ChannelPerformance,
  ReusablePattern,
  EscalationPath,
  PerformanceWorkflowState,
  SocialChannel,
  ContentGoal,
  PerformanceMetric,
  PerformanceMetricType,
  AnalyzePerformanceParams,
  ExtractPatternParams,
  CreateEscalationParams,
  UpdateEscalationStatusParams,
  EscalationTrigger,
  EscalationSeverity,
  EscalationStatus,
  PatternConfidence,
  PatternStatus,
} from "./types.js";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Calculate overall performance score from metrics
 */
function calculateOverallScore(metrics: PerformanceMetric[]): number {
  if (metrics.length === 0) return 0;

  // Weight different metrics
  const weights: Record<PerformanceMetricType, number> = {
    impressions: 0.1,
    reach: 0.15,
    engagement: 0.2,
    clicks: 0.15,
    shares: 0.1,
    comments: 0.1,
    likes: 0.1,
    followers: 0.05,
    conversions: 0.15,
    revenue: 0.1,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const metric of metrics) {
    const weight = weights[metric.type] ?? 0.1;
    
    // Normalize value to 0-100 scale
    // For metrics with previous value, use change percentage (capped at 100%)
    // For absolute values, use a simple scaling approach
    let normalizedValue: number;
    
    if (metric.previousValue && metric.previousValue > 0) {
      // Use change percentage, but cap at 100% improvement
      normalizedValue = Math.min(Math.abs(metric.changePercent ?? 0) * 100, 100);
    } else {
      // For absolute values, assume a baseline and scale
      // This is a simplification - real implementation would use channel-specific baselines
      normalizedValue = Math.min(metric.value / 1000 * 100, 100);
    }

    // Weight by whether change was positive
    const direction = metric.isPositiveChange ? 1 : -0.5;
    weightedSum += normalizedValue * weight * direction;
    totalWeight += weight;
  }

  // Normalize to 0-100 and ensure positive range
  const rawScore = totalWeight > 0 ? (weightedSum / totalWeight) + 50 : 50;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

/**
 * Calculate confidence based on sample size and consistency
 */
function calculateConfidence(sampleSize: number, variance: number): PatternConfidence {
  if (sampleSize >= 10 && variance < 0.2) return "high";
  if (sampleSize >= 5 && variance < 0.4) return "medium";
  return "low";
}

export class PerformanceAnalysisService {
  private state: PerformanceWorkflowState;

  constructor(initialState?: PerformanceWorkflowState) {
    this.state = initialState ?? {
      performances: {},
      patterns: {},
      escalations: {},
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Record performance for a published brief
   * VAL-DEPT-SOCIAL-002
   */
  analyzePerformance(params: AnalyzePerformanceParams): ChannelPerformance {
    const now = new Date().toISOString();
    
    const performance: ChannelPerformance = {
      channel: "x", // Will be set from brief
      briefId: params.briefId,
      publishedAt: now,
      metrics: params.metrics,
      goalAchievement: params.goalAchievement ?? [],
      hypothesisOutcome: undefined,
      overallScore: calculateOverallScore(params.metrics),
    };

    this.state.performances[params.briefId] = performance;
    this.state.lastUpdated = now;
    return performance;
  }

  /**
   * Update performance with hypothesis outcome
   */
  updatePerformanceWithHypothesisOutcome(
    briefId: string,
    hypothesisOutcome: ChannelPerformance["hypothesisOutcome"]
  ): ChannelPerformance | undefined {
    const performance = this.state.performances[briefId];
    if (!performance) return undefined;

    performance.hypothesisOutcome = hypothesisOutcome;
    this.state.lastUpdated = new Date().toISOString();
    return performance;
  }

  /**
   * Get performance for a brief
   */
  getPerformance(briefId: string): ChannelPerformance | undefined {
    return this.state.performances[briefId];
  }

  /**
   * Get all performances
   */
  getAllPerformances(): ChannelPerformance[] {
    return Object.values(this.state.performances);
  }

  /**
   * Get performances by channel
   */
  getPerformancesByChannel(channel: SocialChannel): ChannelPerformance[] {
    return Object.values(this.state.performances).filter((p) => p.channel === channel);
  }

  /**
   * Get top performing briefs
   */
  getTopPerformers(limit: number = 10): ChannelPerformance[] {
    return Object.values(this.state.performances)
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);
  }

  /**
   * Get underperforming briefs
   */
  getUnderperformers(threshold: number = 40): ChannelPerformance[] {
    return Object.values(this.state.performances)
      .filter((p) => p.overallScore < threshold)
      .sort((a, b) => a.overallScore - b.overallScore);
  }

  // ============================================
  // Pattern Extraction (VAL-DEPT-SOCIAL-002)
  // ============================================

  /**
   * Extract a reusable pattern from performance data
   * VAL-DEPT-SOCIAL-002
   */
  extractPattern(params: ExtractPatternParams): ReusablePattern {
    const now = new Date().toISOString();

    // Calculate supporting metrics from evidence briefs
    const supportingMetrics: ReusablePattern["supportingMetrics"] = [];
    const metricTypes: PerformanceMetricType[] = ["engagement", "impressions", "clicks", "shares", "comments"];
    
    for (const metricType of metricTypes) {
      const values: number[] = [];
      
      for (const briefId of params.evidenceBriefIds) {
        const performance = this.state.performances[briefId];
        if (!performance) continue;
        
        const metric = performance.metrics.find((m) => m.type === metricType);
        if (metric && metric.changePercent !== undefined) {
          values.push(metric.changePercent);
        }
      }
      
      if (values.length > 0) {
        const avgLift = values.reduce((a, b) => a + b, 0) / values.length;
        supportingMetrics.push({
          metric: metricType,
          averageLift: Math.round(avgLift * 100) / 100,
          sampleSize: values.length,
        });
      }
    }

    // Calculate success rate and confidence
    const successCount = params.evidenceBriefIds.filter((briefId) => {
      const performance = this.state.performances[briefId];
      return performance && performance.overallScore >= 60;
    }).length;

    const successRate = params.evidenceBriefIds.length > 0
      ? Math.round((successCount / params.evidenceBriefIds.length) * 100)
      : 0;

    const confidence = calculateConfidence(
      params.evidenceBriefIds.length,
      1 - successRate / 100
    );

    const pattern: ReusablePattern = {
      id: generateId(),
      patternKey: params.patternKey,
      title: params.title,
      description: params.description,
      patternType: params.patternType,
      confidence,
      successRate,
      evidenceBriefIds: params.evidenceBriefIds,
      supportingMetrics,
      recommendedFor: {
        channels: params.recommendedFor.channels ?? [],
        contentGoals: params.recommendedFor.contentGoals ?? [],
      },
      status: "discovered",
      firstIdentifiedAt: now,
      lastValidatedAt: now,
      validatedCount: 0,
    };

    this.state.patterns[pattern.id] = pattern;
    this.state.lastUpdated = now;
    return pattern;
  }

  /**
   * Get a pattern by ID
   */
  getPattern(patternId: string): ReusablePattern | undefined {
    return this.state.patterns[patternId];
  }

  /**
   * Get all patterns
   */
  getAllPatterns(): ReusablePattern[] {
    return Object.values(this.state.patterns);
  }

  /**
   * Get patterns by status
   */
  getPatternsByStatus(status: PatternStatus): ReusablePattern[] {
    return Object.values(this.state.patterns).filter((p) => p.status === status);
  }

  /**
   * Get patterns by type
   */
  getPatternsByType(type: ReusablePattern["patternType"]): ReusablePattern[] {
    return Object.values(this.state.patterns).filter((p) => p.patternType === type);
  }

  /**
   * Get validated patterns for a channel
   */
  getValidatedPatternsForChannel(channel: SocialChannel): ReusablePattern[] {
    return Object.values(this.state.patterns).filter(
      (p) =>
        p.status === "validated" &&
        p.recommendedFor.channels.includes(channel)
    );
  }

  /**
   * Get validated patterns for a content goal
   */
  getValidatedPatternsForGoal(goal: ContentGoal): ReusablePattern[] {
    return Object.values(this.state.patterns).filter(
      (p) =>
        p.status === "validated" &&
        p.recommendedFor.contentGoals.includes(goal)
    );
  }

  /**
   * Update pattern status
   * VAL-DEPT-SOCIAL-002
   */
  updatePatternStatus(patternId: string, status: PatternStatus): ReusablePattern | undefined {
    const pattern = this.state.patterns[patternId];
    if (!pattern) return undefined;

    const now = new Date().toISOString();
    pattern.status = status;
    
    if (status === "validated") {
      pattern.validatedCount++;
      pattern.lastValidatedAt = now;
    }
    
    this.state.lastUpdated = now;
    return pattern;
  }

  /**
   * Link additional evidence to a pattern
   */
  linkEvidenceToPattern(patternId: string, briefId: string): ReusablePattern | undefined {
    const pattern = this.state.patterns[patternId];
    if (!pattern) return undefined;

    if (!pattern.evidenceBriefIds.includes(briefId)) {
      pattern.evidenceBriefIds.push(briefId);
      this.state.lastUpdated = new Date().toISOString();
    }

    return pattern;
  }

  /**
   * Discover patterns automatically from performance data
   * VAL-DEPT-SOCIAL-002
   */
  discoverPatterns(minEvidenceCount: number = 3): ReusablePattern[] {
    const discovered: ReusablePattern[] = [];
    const performances = Object.values(this.state.performances);

    // Group by channel and analyze
    const byChannel = new Map<SocialChannel, ChannelPerformance[]>();
    for (const perf of performances) {
      const existing = byChannel.get(perf.channel) ?? [];
      existing.push(perf);
      byChannel.set(perf.channel, existing);
    }

    // Analyze timing patterns
    for (const [channel, perfs] of byChannel) {
      if (perfs.length < minEvidenceCount) continue;

      // Check for day-of-week patterns
      const dayScores = new Map<number, number[]>();
      for (const perf of perfs) {
        const day = new Date(perf.publishedAt).getDay();
        const scores = dayScores.get(day) ?? [];
        scores.push(perf.overallScore);
        dayScores.set(day, scores);
      }

      // Find best performing days
      for (const [day, scores] of dayScores) {
        if (scores.length >= minEvidenceCount) {
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (avgScore >= 65) {
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const pattern = this.extractPattern({
              patternKey: `timing-${channel}-${dayNames[day]}`,
              title: `${dayNames[day]} performs best for ${channel}`,
              description: `Content published on ${dayNames[day]}s shows higher engagement on ${channel}`,
              patternType: "timing",
              evidenceBriefIds: perfs
                .filter((p) => new Date(p.publishedAt).getDay() === day)
                .map((p) => p.briefId),
              recommendedFor: {
                channels: [channel],
              },
            });
            discovered.push(pattern);
          }
        }
      }
    }

    return discovered;
  }

  // ============================================
  // Escalation Paths (VAL-DEPT-SOCIAL-002)
  // ============================================

  /**
   * Create an escalation path
   * VAL-DEPT-SOCIAL-002
   */
  createEscalation(params: CreateEscalationParams): EscalationPath {
    const now = new Date().toISOString();

    const escalation: EscalationPath = {
      id: generateId(),
      trigger: params.trigger,
      severity: params.severity,
      status: "triggered",
      description: params.description,
      affectedBriefIds: params.affectedBriefIds ?? [],
      affectedChannels: params.affectedChannels ?? [],
      triggeredAt: now,
      responseActions: [],
      mitigationNotes: [],
      brandRiskLevel: params.severity,
      operationalRiskLevel: params.severity,
      followUpActionIds: [],
    };

    this.state.escalations[escalation.id] = escalation;
    this.state.lastUpdated = now;
    return escalation;
  }

  /**
   * Get an escalation by ID
   */
  getEscalation(escalationId: string): EscalationPath | undefined {
    return this.state.escalations[escalationId];
  }

  /**
   * Get all escalations
   */
  getAllEscalations(): EscalationPath[] {
    return Object.values(this.state.escalations);
  }

  /**
   * Get active escalations (not resolved or dismissed)
   */
  getActiveEscalations(): EscalationPath[] {
    return Object.values(this.state.escalations).filter(
      (e) => !["resolved", "dismissed"].includes(e.status)
    );
  }

  /**
   * Get escalations by severity
   */
  getEscalationsBySeverity(severity: EscalationSeverity): EscalationPath[] {
    return Object.values(this.state.escalations).filter((e) => e.severity === severity);
  }

  /**
   * Get escalations by trigger
   */
  getEscalationsByTrigger(trigger: EscalationTrigger): EscalationPath[] {
    return Object.values(this.state.escalations).filter((e) => e.trigger === trigger);
  }

  /**
   * Get escalations by channel
   */
  getEscalationsByChannel(channel: SocialChannel): EscalationPath[] {
    return Object.values(this.state.escalations).filter((e) =>
      e.affectedChannels.includes(channel)
    );
  }

  /**
   * Update escalation status
   * VAL-DEPT-SOCIAL-002
   */
  updateEscalationStatus(params: UpdateEscalationStatusParams): EscalationPath | undefined {
    const escalation = this.state.escalations[params.escalationId];
    if (!escalation) return undefined;

    const now = new Date().toISOString();
    escalation.status = params.status;

    if (params.status === "investigating" && !escalation.acknowledgedAt) {
      escalation.acknowledgedAt = now;
    }

    if (params.responseActions) {
      escalation.responseActions.push(...params.responseActions);
    }

    if (params.mitigationNotes) {
      escalation.mitigationNotes.push(...params.mitigationNotes);
    }

    if (params.status === "resolved") {
      escalation.resolvedAt = now;
    }

    this.state.lastUpdated = now;
    return escalation;
  }

  /**
   * Assign escalation to a role
   */
  assignEscalation(escalationId: string, roleKey: string): EscalationPath | undefined {
    const escalation = this.state.escalations[escalationId];
    if (!escalation) return undefined;

    escalation.assignedRoleKey = roleKey;
    this.state.lastUpdated = new Date().toISOString();
    return escalation;
  }

  /**
   * Link a pattern follow-up to an escalation
   */
  linkPatternToEscalation(escalationId: string, patternId: string): EscalationPath | undefined {
    const escalation = this.state.escalations[escalationId];
    if (!escalation) return undefined;

    escalation.followUpPatternId = patternId;
    this.state.lastUpdated = new Date().toISOString();
    return escalation;
  }

  /**
   * Get escalation summary
   */
  getEscalationSummary(): {
    totalEscalations: number;
    byStatus: Record<EscalationStatus, number>;
    bySeverity: Record<EscalationSeverity, number>;
    byTrigger: Record<EscalationTrigger, number>;
    activeEscalations: number;
    criticalActive: number;
  } {
    const escalations = Object.values(this.state.escalations);

    const byStatus: Record<EscalationStatus, number> = {
      triggered: 0,
      investigating: 0,
      mitigating: 0,
      resolved: 0,
      dismissed: 0,
    };

    const bySeverity: Record<EscalationSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const byTrigger: Record<EscalationTrigger, number> = {
      "platform-policy-change": 0,
      "moderation-spike": 0,
      "audience-sentiment-negative": 0,
      "competitor-action": 0,
      "viral-negative": 0,
      "brand-safety-risk": 0,
      "performance-degradation": 0,
    };

    for (const esc of escalations) {
      byStatus[esc.status]++;
      bySeverity[esc.severity]++;
      byTrigger[esc.trigger]++;
    }

    return {
      totalEscalations: escalations.length,
      byStatus,
      bySeverity,
      byTrigger,
      activeEscalations: this.getActiveEscalations().length,
      criticalActive: escalations.filter(
        (e) => e.status !== "resolved" && e.status !== "dismissed" && e.severity === "critical"
      ).length,
    };
  }

  // ============================================
  // Summary and Reporting
  // ============================================

  /**
   * Generate performance summary
   */
  generateSummary(): {
    totalPerformances: number;
    averageScore: number;
    patternsDiscovered: number;
    patternsValidated: number;
    activeEscalations: number;
    topPatterns: ReusablePattern[];
    recentUnderperformers: ChannelPerformance[];
  } {
    const performances = Object.values(this.state.performances);
    const patterns = Object.values(this.state.patterns);

    const avgScore =
      performances.length > 0
        ? Math.round(performances.reduce((sum, p) => sum + p.overallScore, 0) / performances.length)
        : 0;

    return {
      totalPerformances: performances.length,
      averageScore: avgScore,
      patternsDiscovered: patterns.filter((p) => p.status === "discovered").length,
      patternsValidated: patterns.filter((p) => p.status === "validated").length,
      activeEscalations: this.getActiveEscalations().length,
      topPatterns: patterns
        .filter((p) => p.status === "validated")
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5),
      recentUnderperformers: this.getUnderperformers().slice(0, 5),
    };
  }

  /**
   * Get current state for persistence
   */
  getState(): PerformanceWorkflowState {
    return this.state;
  }

  /**
   * Load state from persistence
   */
  loadState(state: PerformanceWorkflowState): void {
    this.state = state;
  }
}
