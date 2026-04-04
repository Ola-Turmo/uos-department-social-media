import { describe, expect, it } from "vitest";
import { connectors, department, jobs, roles, skills } from "../src";
import { ContentPlanningService } from "../src/content-planning-service";
import { PerformanceAnalysisService } from "../src/performance-analysis-service";
import type {
  SocialChannel,
  ContentFormat,
  ContentGoal,
  PerformanceMetric,
  ReusablePattern,
} from "../src/types";

describe("@uos/department-social-media", () => {
  it("captures the social media department boundary", () => {
    expect(department.departmentId).toBe("social-media");
    expect(department.parentFunctionId).toBe("growth");
    expect(department.moduleId).toBe("autonomous-social-media");
  });

  it("includes the social leadership, channel, and review roles", () => {
    expect(roles.some((role) => role.roleKey === "growth-social-content-lead")).toBe(true);
    expect(roles.some((role) => role.roleKey === "growth-x-publisher-specialist")).toBe(true);
    expect(roles.some((role) => role.roleKey === "growth-brand-safety-reviewer")).toBe(true);
    expect(jobs.map((job) => job.jobKey)).toEqual([
      "social-daily-optimization-loop",
      "social-weekly-content-planning-review",
    ]);
  });

  it("keeps social skill bundles and channel toolkit mappings together", () => {
    expect(skills.bundleIds).toContain("uos-social-content");
    expect(skills.externalSkills.some((skill) => skill.id === "uos-external-social-content")).toBe(true);
    expect(connectors.requiredToolkits).toContain("x");
    expect(connectors.requiredToolkits).toContain("instagram");
    expect(connectors.roleToolkits.some((role) => role.roleKey === "growth-youtube-publisher-specialist")).toBe(true);
  });
});

describe("ContentPlanningService", () => {
  const service = new ContentPlanningService();

  describe("brief creation and workflow", () => {
    it("creates a content brief with channel-specific configuration", () => {
      const brief = service.createBrief({
        title: "Q2 Product Launch Campaign",
        description: "Content brief for Q2 product launch",
        channel: "x",
        contentFormat: "text",
        topic: "Product launch announcement",
        targetAudience: "Tech professionals, 25-45",
        contentGoals: ["awareness", "engagement"],
        createdByRoleKey: "growth-social-content-lead",
        tags: ["product-launch", "q2"],
      });

      expect(brief.id).toBeDefined();
      expect(brief.channel).toBe("x");
      expect(brief.contentFormat).toBe("text");
      expect(brief.status).toBe("draft");
      expect(brief.contentGoals).toContain("awareness");
      expect(brief.contentGoals).toContain("engagement");
      expect(brief.tags).toContain("product-launch");
    });

    it("creates a brief with experiment hypothesis", () => {
      const brief = service.createBrief({
        title: "Image vs Text Test",
        description: "Testing image impact on engagement",
        channel: "instagram",
        contentFormat: "image",
        topic: "Engagement comparison test",
        targetAudience: "General audience",
        contentGoals: ["engagement"],
        createdByRoleKey: "growth-social-content-lead",
        experimentHypothesis: {
          hypothesis: "Posts with images get 2x engagement compared to text-only",
          successMetric: "engagement_rate",
          targetChange: 1.0,
          confidenceLevel: "medium",
        },
      });

      expect(brief.experimentHypothesis).toBeDefined();
      expect(brief.experimentHypothesis?.hypothesis).toContain("2x engagement");
      expect(brief.experimentHypothesis?.targetChange).toBe(1.0);
    });

    it("supports multiple channels", () => {
      const channels: SocialChannel[] = ["x", "instagram", "youtube", "tiktok", "facebook", "linkedin", "reddit", "blog"];
      
      for (const channel of channels) {
        const brief = service.createBrief({
          title: `Brief for ${channel}`,
          description: `Testing ${channel} brief creation`,
          channel,
          contentFormat: channel === "blog" ? "text" : "image",
          topic: "Test content",
          targetAudience: "Test audience",
          contentGoals: ["awareness"],
          createdByRoleKey: "growth-social-content-lead",
        });

        expect(brief.channel).toBe(channel);
        expect(brief.status).toBe("draft");
      }
    });

    it("returns briefs by status correctly", () => {
      service.createBrief({
        title: "Draft Brief",
        description: "Draft",
        channel: "x",
        contentFormat: "text",
        topic: "Test",
        targetAudience: "Test",
        contentGoals: ["awareness"],
        createdByRoleKey: "growth-social-content-lead",
      });

      const approved = service.createBrief({
        title: "Approved Brief",
        description: "Approved",
        channel: "x",
        contentFormat: "text",
        topic: "Test",
        targetAudience: "Test",
        contentGoals: ["awareness"],
        createdByRoleKey: "growth-social-content-lead",
      });

      // Manually set status for testing
      approved.status = "approved";

      expect(service.getBriefsByStatus("draft").length).toBeGreaterThanOrEqual(1);
      expect(service.getBriefsByStatus("approved").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("review and approval workflow", () => {
    it("moves brief through review to approval states", () => {
      const brief = service.createBrief({
        title: "Review Test Brief",
        description: "Testing review workflow",
        channel: "instagram",
        contentFormat: "image",
        topic: "Review test",
        targetAudience: "Test audience",
        contentGoals: ["engagement"],
        createdByRoleKey: "growth-social-content-lead",
      });

      // Submit for review
      const submitted = service.submitForReview({
        briefId: brief.id,
        reviewerRoleKey: "growth-brand-safety-reviewer",
      });

      expect(submitted?.status).toBe("pending-review");

      // Review and approve
      const reviewed = service.reviewBrief({
        briefId: brief.id,
        reviewerRoleKey: "growth-brand-safety-reviewer",
        brandSafetyCheck: { passed: true, flags: [], notes: "All checks passed" },
        channelFitCheck: { passed: true, flags: [] },
        contentQualityCheck: { passed: true, flags: [] },
        decision: "approved",
        feedback: "Looks good, ready for approval",
      });

      expect(reviewed?.status).toBe("pending-approval");

      // Approve
      const approved = service.approveBrief({
        briefId: brief.id,
        approverRoleKey: "growth-social-content-lead",
        decision: "approved",
        feedback: "Approved for publishing",
      });

      expect(approved?.status).toBe("approved");
      expect(approved?.approvals.length).toBe(1);
      expect(approved?.approvals[0].decision).toBe("approved");
    });

    it("rejects brief when brand safety check fails", () => {
      const brief = service.createBrief({
        title: "Brand Safety Test",
        description: "Testing brand safety rejection",
        channel: "x",
        contentFormat: "text",
        topic: "Sensitive topic",
        targetAudience: "General",
        contentGoals: ["engagement"],
        createdByRoleKey: "growth-social-content-lead",
      });

      service.submitForReview({
        briefId: brief.id,
        reviewerRoleKey: "growth-brand-safety-reviewer",
      });

      const reviewed = service.reviewBrief({
        briefId: brief.id,
        reviewerRoleKey: "growth-brand-safety-reviewer",
        brandSafetyCheck: { passed: false, flags: ["sensitive-topic"], notes: "Needs legal review" },
        channelFitCheck: { passed: true, flags: [] },
        contentQualityCheck: { passed: true, flags: [] },
        decision: "rejected",
        feedback: "Brand safety concern - needs legal review",
      });

      expect(reviewed?.status).toBe("rejected");
      expect(reviewed?.reviews[0].brandSafetyCheck.passed).toBe(false);
    });

    it("sends brief back for revision when requested", () => {
      const brief = service.createBrief({
        title: "Revision Test",
        description: "Testing revision request",
        channel: "x",
        contentFormat: "text",
        topic: "Test",
        targetAudience: "Test",
        contentGoals: ["engagement"],
        createdByRoleKey: "growth-social-content-lead",
      });

      service.submitForReview({
        briefId: brief.id,
        reviewerRoleKey: "growth-brand-safety-reviewer",
      });

      const reviewed = service.reviewBrief({
        briefId: brief.id,
        reviewerRoleKey: "growth-brand-safety-reviewer",
        brandSafetyCheck: { passed: true, flags: [] },
        channelFitCheck: { passed: false, flags: ["needs-hashtags"] },
        contentQualityCheck: { passed: true, flags: [] },
        decision: "revision-requested",
        feedback: "Please add relevant hashtags",
      });

      expect(reviewed?.status).toBe("draft");
    });
  });

  describe("publishing workflow", () => {
    it("publishes approved brief", () => {
      const brief = service.createBrief({
        title: "Publish Test",
        description: "Testing publish workflow",
        channel: "x",
        contentFormat: "text",
        topic: "Test",
        targetAudience: "Test",
        contentGoals: ["awareness"],
        createdByRoleKey: "growth-social-content-lead",
      });

      // Move through workflow
      service.submitForReview({ briefId: brief.id, reviewerRoleKey: "growth-brand-safety-reviewer" });
      service.reviewBrief({
        briefId: brief.id,
        reviewerRoleKey: "growth-brand-safety-reviewer",
        brandSafetyCheck: { passed: true, flags: [] },
        channelFitCheck: { passed: true, flags: [] },
        contentQualityCheck: { passed: true, flags: [] },
        decision: "approved",
      });
      service.approveBrief({
        briefId: brief.id,
        approverRoleKey: "growth-social-content-lead",
        decision: "approved",
      });

      // Publish
      const published = service.publishBrief({
        briefId: brief.id,
        draftContent: "Hello world! This is our announcement.",
        publishedAt: new Date().toISOString(),
      });

      expect(published?.status).toBe("published");
      expect(published?.draftContent).toBe("Hello world! This is our announcement.");
      expect(published?.publishedAt).toBeDefined();
    });

    it("prevents publishing non-approved brief", () => {
      const brief = service.createBrief({
        title: "Draft Only",
        description: "Should not publish",
        channel: "x",
        contentFormat: "text",
        topic: "Test",
        targetAudience: "Test",
        contentGoals: ["awareness"],
        createdByRoleKey: "growth-social-content-lead",
      });

      const result = service.publishBrief({
        briefId: brief.id,
        draftContent: "Trying to publish draft",
      });

      expect(result).toBeUndefined();
      expect(brief.status).toBe("draft");
    });
  });

  describe("channel configuration", () => {
    it("returns correct channel configurations", () => {
      const xConfig = service.getChannelConfig("x");
      expect(xConfig.channel).toBe("x");
      expect(xConfig.maxCaptionLength).toBe(280);
      expect(xConfig.contentFormats).toContain("text");
      expect(xConfig.contentFormats).toContain("image");

      const igConfig = service.getChannelConfig("instagram");
      expect(igConfig.maxCaptionLength).toBe(2200);
      expect(igConfig.hashtagLimit).toBe(30);
      expect(igConfig.mediaRequirements.imageMinWidth).toBe(1080);
    });

    it("returns all supported channels", () => {
      const channels = service.getSupportedChannels();
      expect(channels).toContain("x");
      expect(channels).toContain("instagram");
      expect(channels).toContain("youtube");
      expect(channels).toContain("tiktok");
      expect(channels.length).toBe(8);
    });
  });

  describe("summary generation", () => {
    it("generates accurate summary", () => {
      const summary = service.generateSummary();
      
      expect(summary.totalBriefs).toBeGreaterThanOrEqual(0);
      expect(summary.byStatus).toBeDefined();
      expect(summary.byChannel).toBeDefined();
      expect(typeof summary.pendingReview).toBe("number");
      expect(typeof summary.pendingApproval).toBe("number");
      expect(typeof summary.approved).toBe("number");
      expect(typeof summary.published).toBe("number");
    });
  });
});

describe("PerformanceAnalysisService", () => {
  const perfService = new PerformanceAnalysisService();
  const contentService = new ContentPlanningService();

  describe("performance analysis", () => {
    it("records performance for published content", () => {
      const metrics: PerformanceMetric[] = [
        { type: "impressions", value: 10000, previousValue: 8000, changePercent: 0.25, isPositiveChange: true },
        { type: "engagement", value: 500, previousValue: 300, changePercent: 0.67, isPositiveChange: true },
        { type: "clicks", value: 200, previousValue: 150, changePercent: 0.33, isPositiveChange: true },
      ];

      const performance = perfService.analyzePerformance({
        briefId: "test-brief-1",
        metrics,
        goalAchievement: [{ goal: "awareness", achieved: true, details: "25% increase in impressions" }],
      });

      expect(performance.briefId).toBe("test-brief-1");
      expect(performance.metrics.length).toBe(3);
      expect(performance.overallScore).toBeGreaterThan(0);
    });

    it("calculates score considering positive vs negative changes", () => {
      const positiveMetrics: PerformanceMetric[] = [
        { type: "engagement", value: 100, previousValue: 50, changePercent: 1.0, isPositiveChange: true },
      ];

      const negativeMetrics: PerformanceMetric[] = [
        { type: "engagement", value: 50, previousValue: 100, changePercent: -0.5, isPositiveChange: false },
      ];

      const positivePerf = perfService.analyzePerformance({ briefId: "pos", metrics: positiveMetrics });
      const negativePerf = perfService.analyzePerformance({ briefId: "neg", metrics: negativeMetrics });

      expect(positivePerf.overallScore).toBeGreaterThan(negativePerf.overallScore);
    });
  });

  describe("reusable pattern extraction", () => {
    it("extracts pattern from multiple high-performing briefs", () => {
      // Create and analyze multiple briefs with good performance
      const briefIds: string[] = [];
      
      for (let i = 0; i < 3; i++) {
        const briefId = `pattern-brief-${i}`;
        briefIds.push(briefId);
        
        perfService.analyzePerformance({
          briefId,
          metrics: [
            { type: "engagement", value: 500 + i * 100, previousValue: 300, changePercent: 0.5 + i * 0.1, isPositiveChange: true },
            { type: "impressions", value: 10000, previousValue: 8000, changePercent: 0.25, isPositiveChange: true },
          ],
        });
      }

      const pattern = perfService.extractPattern({
        patternKey: "engagement-boost-format",
        title: "Image posts with 3 hashtags get higher engagement",
        description: "Analysis shows image posts with 3 relevant hashtags outperform other formats",
        patternType: "format",
        evidenceBriefIds: briefIds,
        recommendedFor: {
          channels: ["x", "instagram"],
          contentGoals: ["engagement"],
        },
      });

      expect(pattern.id).toBeDefined();
      expect(pattern.patternType).toBe("format");
      expect(pattern.evidenceBriefIds.length).toBe(3);
      expect(pattern.recommendedFor.channels).toContain("x");
      expect(pattern.recommendedFor.channels).toContain("instagram");
      expect(pattern.recommendedFor.contentGoals).toContain("engagement");
    });

    it("validates pattern status correctly", () => {
      const pattern = perfService.extractPattern({
        patternKey: "test-pattern",
        title: "Test pattern",
        description: "Testing pattern validation",
        patternType: "timing",
        evidenceBriefIds: ["brief-1", "brief-2"],
        recommendedFor: { channels: ["x"], contentGoals: ["awareness"] },
      });

      expect(pattern.status).toBe("discovered");

      const validated = perfService.updatePatternStatus(pattern.id, "validated");
      expect(validated?.status).toBe("validated");
      expect(validated?.validatedCount).toBe(1);
      expect(validated?.lastValidatedAt).toBeDefined();
    });

    it("discovers patterns automatically from performance data", () => {
      // Create multiple performances with scores
      for (let i = 0; i < 5; i++) {
        perfService.analyzePerformance({
          briefId: `auto-brief-${i}`,
          metrics: [
            { type: "engagement", value: 300 + i * 20, isPositiveChange: true },
            { type: "impressions", value: 5000 + i * 500, isPositiveChange: true },
          ],
        });
      }

      const patterns = perfService.discoverPatterns(2);
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe("escalation paths", () => {
    it("creates escalation for platform policy change", () => {
      const escalation = perfService.createEscalation({
        trigger: "platform-policy-change",
        severity: "high",
        description: "X announced new content policies affecting promotional content",
        affectedBriefIds: ["brief-1", "brief-2"],
        affectedChannels: ["x"],
      });

      expect(escalation.id).toBeDefined();
      expect(escalation.trigger).toBe("platform-policy-change");
      expect(escalation.severity).toBe("high");
      expect(escalation.status).toBe("triggered");
      expect(escalation.affectedChannels).toContain("x");
    });

    it("creates escalation for moderation spike", () => {
      const escalation = perfService.createEscalation({
        trigger: "moderation-spike",
        severity: "critical",
        description: "Unusual moderation activity detected - potential false positives",
        affectedChannels: ["instagram", "facebook"],
      });

      expect(escalation.trigger).toBe("moderation-spike");
      expect(escalation.severity).toBe("critical");
    });

    it("updates escalation through lifecycle", () => {
      const escalation = perfService.createEscalation({
        trigger: "brand-safety-risk",
        severity: "high",
        description: "Brand safety concern detected",
      });

      // Acknowledge
      const investigating = perfService.updateEscalationStatus({
        escalationId: escalation.id,
        status: "investigating",
        responseActions: ["Reviewing affected content", "Contacting platform"],
      });

      expect(investigating?.status).toBe("investigating");
      expect(investigating?.acknowledgedAt).toBeDefined();

      // Mitigate
      const mitigating = perfService.updateEscalationStatus({
        escalationId: escalation.id,
        status: "mitigating",
        mitigationNotes: ["Paused scheduled posts", "Increased monitoring"],
      });

      expect(mitigating?.status).toBe("mitigating");

      // Resolve
      const resolved = perfService.updateEscalationStatus({
        escalationId: escalation.id,
        status: "resolved",
        mitigationNotes: ["Risk assessed and addressed"],
      });

      expect(resolved?.status).toBe("resolved");
      expect(resolved?.resolvedAt).toBeDefined();
    });

    it("returns active escalations correctly", () => {
      // Create various escalations
      perfService.createEscalation({
        trigger: "platform-policy-change",
        severity: "high",
        description: "Active issue",
      });

      perfService.createEscalation({
        trigger: "brand-safety-risk",
        severity: "medium",
        description: "Resolved issue",
      });

      // Update one to resolved
      const escalations = perfService.getAllEscalations();
      const toResolve = escalations.find(e => e.trigger === "brand-safety-risk");
      if (toResolve) {
        perfService.updateEscalationStatus({
          escalationId: toResolve.id,
          status: "resolved",
        });
      }

      const active = perfService.getActiveEscalations();
      expect(active.length).toBeGreaterThanOrEqual(1);
      expect(active.every(e => !["resolved", "dismissed"].includes(e.status))).toBe(true);
    });
  });

  describe("summary and reporting", () => {
    it("generates performance summary", () => {
      // Add some test data
      perfService.analyzePerformance({
        briefId: "sum-brief-1",
        metrics: [
          { type: "engagement", value: 500, isPositiveChange: true },
          { type: "impressions", value: 10000, isPositiveChange: true },
        ],
      });

      perfService.analyzePerformance({
        briefId: "sum-brief-2",
        metrics: [
          { type: "engagement", value: 300, isPositiveChange: true },
          { type: "impressions", value: 8000, isPositiveChange: true },
        ],
      });

      const summary = perfService.generateSummary();
      
      expect(summary.totalPerformances).toBeGreaterThanOrEqual(2);
      expect(typeof summary.averageScore).toBe("number");
      expect(summary.patternsDiscovered).toBeGreaterThanOrEqual(0);
      expect(summary.activeEscalations).toBeGreaterThanOrEqual(0);
    });

    it("generates escalation summary", () => {
      const summary = perfService.getEscalationSummary();
      
      expect(typeof summary.totalEscalations).toBe("number");
      expect(summary.byStatus).toBeDefined();
      expect(summary.bySeverity).toBeDefined();
      expect(summary.byTrigger).toBeDefined();
      expect(typeof summary.activeEscalations).toBe("number");
      expect(typeof summary.criticalActive).toBe("number");
    });
  });
});

describe("VAL-DEPT-SOCIAL-001: Content planning produces reviewed channel-specific briefs", () => {
  const service = new ContentPlanningService();

  it("creates channel-specific briefs with experiment hypotheses", () => {
    const brief = service.createBrief({
      title: "X Engagement Experiment",
      description: "Testing optimal posting time",
      channel: "x",
      contentFormat: "text",
      topic: "Time-based engagement",
      targetAudience: "Tech professionals",
      contentGoals: ["engagement"],
      createdByRoleKey: "growth-social-content-lead",
      experimentHypothesis: {
        hypothesis: "Posts between 9-11am get 50% more engagement",
        successMetric: "engagement_rate",
        targetChange: 0.5,
        confidenceLevel: "high",
      },
    });

    expect(brief.experimentHypothesis).toBeDefined();
    expect(brief.experimentHypothesis?.hypothesis).toContain("9-11am");
  });

  it("routes briefs through safety and fit review", () => {
    const brief = service.createBrief({
      title: "Review Flow Test",
      description: "Testing review routing",
      channel: "instagram",
      contentFormat: "image",
      topic: "Product showcase",
      targetAudience: "General audience",
      contentGoals: ["awareness", "engagement"],
      createdByRoleKey: "growth-social-content-lead",
    });

    // Submit for review
    service.submitForReview({
      briefId: brief.id,
      reviewerRoleKey: "growth-brand-safety-reviewer",
    });

    // Review with brand safety and channel fit checks
    const reviewed = service.reviewBrief({
      briefId: brief.id,
      reviewerRoleKey: "growth-brand-safety-reviewer",
      brandSafetyCheck: { passed: true, flags: [], notes: "No brand safety concerns" },
      channelFitCheck: { passed: true, flags: [], notes: "Good fit for Instagram audience" },
      contentQualityCheck: { passed: true, flags: [], notes: "High quality content" },
      decision: "approved",
    });

    expect(reviewed?.reviews.length).toBe(1);
    expect(reviewed?.reviews[0].brandSafetyCheck.passed).toBe(true);
    expect(reviewed?.reviews[0].channelFitCheck.passed).toBe(true);
  });

  it("preserves explicit approval steps before publishing", () => {
    const brief = service.createBrief({
      title: "Approval Gate Test",
      description: "Testing approval gate",
      channel: "x",
      contentFormat: "text",
      topic: "Important announcement",
      targetAudience: "All followers",
      contentGoals: ["awareness"],
      createdByRoleKey: "growth-social-content-lead",
    });

    // Cannot skip review
    expect(service.approveBrief({
      briefId: brief.id,
      approverRoleKey: "growth-social-content-lead",
      decision: "approved",
    })).toBeUndefined();

    // Move through full workflow
    service.submitForReview({ briefId: brief.id, reviewerRoleKey: "growth-brand-safety-reviewer" });
    service.reviewBrief({
      briefId: brief.id,
      reviewerRoleKey: "growth-brand-safety-reviewer",
      brandSafetyCheck: { passed: true, flags: [] },
      channelFitCheck: { passed: true, flags: [] },
      contentQualityCheck: { passed: true, flags: [] },
      decision: "approved",
    });

    // Cannot skip approval
    expect(service.publishBrief({ briefId: brief.id, draftContent: "Test" })).toBeUndefined();

    // Must have approval
    service.approveBrief({
      briefId: brief.id,
      approverRoleKey: "growth-social-content-lead",
      decision: "approved",
    });

    // Now can publish
    const published = service.publishBrief({
      briefId: brief.id,
      draftContent: "Important announcement content",
    });

    expect(published?.status).toBe("published");
    expect(published?.approvals.length).toBe(1);
  });
});

describe("VAL-DEPT-SOCIAL-002: Performance analysis creates reusable patterns and escalation paths", () => {
  const perfService = new PerformanceAnalysisService();
  const contentService = new ContentPlanningService();

  it("analyzes outcomes against hypotheses", () => {
    const metrics: PerformanceMetric[] = [
      { type: "engagement", value: 750, previousValue: 500, changePercent: 0.5, isPositiveChange: true },
      { type: "impressions", value: 15000, previousValue: 12000, changePercent: 0.25, isPositiveChange: true },
    ];

    const performance = perfService.analyzePerformance({
      briefId: "hypothesis-test",
      metrics,
    });

    expect(performance.metrics.length).toBe(2);
    
    // Update with hypothesis outcome
    const updated = perfService.updatePerformanceWithHypothesisOutcome(
      "hypothesis-test",
      {
        hypothesisId: "hyp-1",
        validated: true,
        actualChange: 0.5,
        analysis: "Hypothesis confirmed - 9-11am posting time resulted in 50% engagement increase",
      }
    );

    expect(updated?.hypothesisOutcome?.validated).toBe(true);
    expect(updated?.hypothesisOutcome?.actualChange).toBe(0.5);
  });

  it("extracts reusable patterns for future briefs", () => {
    // Create evidence briefs
    const briefIds = ["pattern-1", "pattern-2", "pattern-3"];
    
    for (const briefId of briefIds) {
      perfService.analyzePerformance({
        briefId,
        metrics: [
          { type: "engagement", value: 600, previousValue: 400, changePercent: 0.5, isPositiveChange: true },
          { type: "shares", value: 50, previousValue: 30, changePercent: 0.67, isPositiveChange: true },
        ],
      });
    }

    const pattern = perfService.extractPattern({
      patternKey: "engagement-timing-pattern",
      title: "Morning posts (9-11am) outperform afternoon posts",
      description: "Based on analysis of 3 campaigns, morning posts consistently achieve higher engagement",
      patternType: "timing",
      evidenceBriefIds: briefIds,
      recommendedFor: {
        channels: ["x", "linkedin"],
        contentGoals: ["engagement", "awareness"],
      },
    });

    expect(pattern.evidenceBriefIds.length).toBe(3);
    expect(pattern.supportingMetrics.length).toBeGreaterThan(0);
    expect(pattern.recommendedFor.channels).toContain("x");
  });

  it("supports escalation for platform or moderation risks", () => {
    // Create escalation for platform policy change
    const escalation = perfService.createEscalation({
      trigger: "platform-policy-change",
      severity: "high",
      description: "X announced restrictions on promotional content",
      affectedBriefIds: ["brief-a", "brief-b"],
      affectedChannels: ["x"],
    });

    expect(escalation.trigger).toBe("platform-policy-change");
    expect(escalation.severity).toBe("high");
    expect(escalation.affectedChannels).toContain("x");

    // Create escalation for moderation spike
    const modEscalation = perfService.createEscalation({
      trigger: "moderation-spike",
      severity: "critical",
      description: "Unusual moderation activity - potential false positive removals",
      affectedChannels: ["instagram"],
    });

    expect(modEscalation.trigger).toBe("moderation-spike");
    expect(modEscalation.severity).toBe("critical");

    // Get active escalations
    const active = perfService.getActiveEscalations();
    expect(active.some(e => e.trigger === "platform-policy-change")).toBe(true);
    expect(active.some(e => e.trigger === "moderation-spike")).toBe(true);
  });

  it("links patterns to escalation follow-ups", () => {
    const escalation = perfService.createEscalation({
      trigger: "performance-degradation",
      severity: "medium",
      description: "Engagement dropped significantly across channels",
    });

    const pattern = perfService.extractPattern({
      patternKey: "degradation-analysis",
      title: "Content format analysis after algorithm change",
      description: "Video content underperforming since algorithm update",
      patternType: "format",
      evidenceBriefIds: ["deg-1", "deg-2"],
      recommendedFor: { channels: ["x", "instagram"], contentGoals: ["engagement"] },
    });

    // Link pattern to escalation follow-up
    const linked = perfService.linkPatternToEscalation(escalation.id, pattern.id);
    expect(linked?.followUpPatternId).toBe(pattern.id);
  });
});
