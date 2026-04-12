/**
 * Trend Detector Service Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { TrendDetectorService, Trend } from "../src/content/trend-detector.ts";

describe("TrendDetectorService", () => {
  let service: TrendDetectorService;

  beforeEach(() => {
    service = new TrendDetectorService();
  });

  describe("detectTrends", () => {
    it("should return all trends when no filters applied", () => {
      const trends = service.detectTrends();
      expect(trends.length).toBeGreaterThan(0);
      expect(trends.length).toBeLessThanOrEqual(50);
    });

    it("should filter trends by minimum velocity", () => {
      const trends = service.detectTrends({ minVelocity: 100 });
      for (const trend of trends) {
        expect(trend.velocity).toBeGreaterThanOrEqual(100);
      }
    });

    it("should filter trends by categories", () => {
      const trends = service.detectTrends({ categories: ["education"] });
      for (const trend of trends) {
        expect(trend.category).toBe("education");
      }
    });

    it("should sort trends by velocity descending", () => {
      const trends = service.detectTrends({ minVelocity: 50 });
      for (let i = 1; i < trends.length; i++) {
        expect(trends[i - 1].velocity).toBeGreaterThanOrEqual(trends[i].velocity);
      }
    });

    it("should respect limit parameter", () => {
      const trends = service.detectTrends({ limit: 3 });
      expect(trends.length).toBeLessThanOrEqual(3);
    });
  });

  describe("findOpportunities", () => {
    it("should return empty array when no briefs provided", () => {
      const opportunities = service.findOpportunities({ briefs: [] });
      expect(opportunities).toEqual([]);
    });

    it("should match trends to existing briefs", () => {
      const briefs = [
        {
          id: "brief-001",
          topic: "University Innovation",
          channel: "x" as const,
          contentGoals: ["awareness"] as const,
          tags: ["#University", "#Innovation"],
        },
      ];
      const opportunities = service.findOpportunities({ briefs });
      expect(opportunities.length).toBeGreaterThan(0);
    });

    it("should filter by minimum match score", () => {
      const briefs = [
        {
          id: "brief-001",
          topic: "AI In Education",
          channel: "x" as const,
          contentGoals: ["awareness"] as const,
          tags: ["#AI", "#Education"],
        },
      ];
      const opportunities = service.findOpportunities({
        briefs,
        minMatchScore: 50,
      });
      for (const opp of opportunities) {
        expect(opp.matchScore).toBeGreaterThanOrEqual(50);
      }
    });

    it("should sort opportunities by match score descending", () => {
      const briefs = [
        { id: "1", topic: "Education", channel: "x" as const, contentGoals: ["awareness"] as const, tags: ["#edu"] },
        { id: "2", topic: "Technology", channel: "instagram" as const, contentGoals: ["engagement"] as const, tags: ["#tech"] },
      ];
      const opportunities = service.findOpportunities({ briefs });
      for (let i = 1; i < opportunities.length; i++) {
        expect(opportunities[i - 1].matchScore).toBeGreaterThanOrEqual(
          opportunities[i].matchScore
        );
      }
    });

    it("should include urgency levels in opportunities", () => {
      const briefs = [
        {
          id: "brief-001",
          topic: "Research",
          channel: "x" as const,
          contentGoals: ["awareness"] as const,
          tags: ["#Research"],
        },
      ];
      const opportunities = service.findOpportunities({ briefs });
      for (const opp of opportunities) {
        expect(["low", "medium", "high", "critical"]).toContain(opp.urgency);
      }
    });
  });

  describe("getBreakingAlerts", () => {
    it("should return trends with velocity > 100", () => {
      const alerts = service.getBreakingAlerts();
      const highVelocityAlerts = alerts.filter((t) => t.velocity > 100);
      expect(highVelocityAlerts.length).toBeGreaterThan(0);
    });

    it("should return trends with sentiment < 0.3", () => {
      const alerts = service.getBreakingAlerts();
      const negativeSentimentAlerts = alerts.filter((t) => t.sentiment < 0.3);
      expect(negativeSentimentAlerts.length).toBeGreaterThan(0);
    });

    it("should return trends with either high velocity or negative sentiment", () => {
      const alerts = service.getBreakingAlerts();
      for (const alert of alerts) {
        const isHighVelocity = alert.velocity > 100;
        const isNegativeSentiment = alert.sentiment < 0.3;
        expect(isHighVelocity || isNegativeSentiment).toBe(true);
      }
    });
  });
});
