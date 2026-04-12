/**
 * AI Content Generator Service Tests
 */

import { describe, it, expect } from "vitest";
import {
  AIContentGeneratorService,
  GenerateBriefParams,
  GenerateCaptionParams,
  GenerateVariationsParams,
  ScoreViralPotentialParams,
} from "../src/content/ai-generator.js";

describe("AIContentGeneratorService", () => {
  const service = new AIContentGeneratorService(42);

  describe("generateBrief", () => {
    it("should generate a brief with all required fields", () => {
      const params: GenerateBriefParams = {
        topic: "Digital Marketing Trends",
        targetAudience: "Marketing Professionals",
        channel: "linkedin",
        contentFormat: "text",
        contentGoals: ["awareness", "engagement"],
      };

      const result = service.generateBrief(params);

      expect(result).toBeDefined();
      expect(result.title).toBeTruthy();
      expect(result.description).toBeTruthy();
      expect(result.topic).toBe("Digital Marketing Trends");
      expect(result.targetAudience).toBe("Marketing Professionals");
      expect(result.keyMessages).toBeDefined();
      expect(Array.isArray(result.keyMessages)).toBe(true);
      expect(result.suggestedHashtags).toBeDefined();
      expect(Array.isArray(result.suggestedHashtags)).toBe(true);
      expect(result.draftCaption).toBeTruthy();
      expect(result.confidenceScore).toBeGreaterThan(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
    });

    it("should use provided keyMessages when given", () => {
      const params: GenerateBriefParams = {
        topic: "AI in Education",
        targetAudience: "Educators",
        channel: "instagram",
        contentFormat: "reel",
        contentGoals: ["engagement"],
        keyMessages: ["AI transforms learning", "Personalized education", "Future of schooling"],
      };

      const result = service.generateBrief(params);

      expect(result.keyMessages).toEqual([
        "AI transforms learning",
        "Personalized education",
        "Future of schooling",
      ]);
    });

    it("should generate channel-specific content tone", () => {
      const xParams: GenerateBriefParams = {
        topic: "Tech News",
        targetAudience: "Tech enthusiasts",
        channel: "x",
        contentFormat: "text",
        contentGoals: ["awareness"],
      };

      const igParams: GenerateBriefParams = {
        topic: "Tech News",
        targetAudience: "Tech enthusiasts",
        channel: "instagram",
        contentFormat: "image",
        contentGoals: ["awareness"],
      };

      const xResult = service.generateBrief(xParams);
      const igResult = service.generateBrief(igParams);

      // Different channels should produce different descriptions
      expect(xResult.description).not.toEqual(igResult.description);
      // X should mention concise/punchy
      expect(xResult.description).toContain("concise");
      // Instagram should mention visually descriptive
      expect(igResult.description).toContain("visually");
    });
  });

  describe("generateCaption", () => {
    it("should generate caption and hashtags", () => {
      const params: GenerateCaptionParams = {
        topic: "Climate Action",
        channel: "twitter",
        contentFormat: "text",
        includeHashtags: true,
      };

      const result = service.generateCaption(params);

      expect(result.caption).toBeTruthy();
      expect(result.hashtags).toBeDefined();
      expect(Array.isArray(result.hashtags)).toBe(true);
      expect(result.caption.length).toBeGreaterThan(0);
    });

    it("should respect tone parameter", () => {
      const professionalParams: GenerateCaptionParams = {
        topic: "Quarterly Results",
        channel: "linkedin",
        contentFormat: "text",
        includeHashtags: false,
        tone: "professional",
      };

      const humorousParams: GenerateCaptionParams = {
        topic: "Quarterly Results",
        channel: "linkedin",
        contentFormat: "text",
        includeHashtags: false,
        tone: "humorous",
      };

      const professionalResult = service.generateCaption(professionalParams);
      const humorousResult = service.generateCaption(humorousParams);

      // Results should be different based on tone
      expect(professionalResult.caption).not.toEqual(humorousResult.caption);
    });

    it("should limit hashtags based on channel", () => {
      const instagramParams: GenerateCaptionParams = {
        topic: "Travel",
        channel: "instagram",
        contentFormat: "image",
        includeHashtags: true,
      };

      const xParams: GenerateCaptionParams = {
        topic: "Travel",
        channel: "x",
        contentFormat: "text",
        includeHashtags: true,
      };

      const igResult = service.generateCaption(instagramParams);
      const xResult = service.generateCaption(xParams);

      // Instagram allows up to 30, X allows up to 10
      expect(igResult.hashtags.length).toBeLessThanOrEqual(30);
      expect(xResult.hashtags.length).toBeLessThanOrEqual(10);
    });
  });

  describe("generateVariations", () => {
    it("should generate requested number of variations", () => {
      const params: GenerateVariationsParams = {
        originalContent: "Discover amazing features in our new product launch!",
        channel: "instagram",
        contentFormat: "carousel",
        variationTypes: ["tone-shift", "length-variant", "format-change"],
        count: 3,
      };

      const result = service.generateVariations(params);

      expect(result).toBeDefined();
      expect(result.length).toBe(3);
    });

    it("should include all variation types requested", () => {
      const params: GenerateVariationsParams = {
        originalContent: "Summer sale starts now!",
        channel: "facebook",
        contentFormat: "video",
        variationTypes: ["tone-shift", "audience-adjustment"],
        count: 2,
      };

      const result = service.generateVariations(params);

      expect(result[0].variationType).toBe("tone-shift");
      expect(result[1].variationType).toBe("audience-adjustment");
    });

    it("should include estimated reach for each variation", () => {
      const params: GenerateVariationsParams = {
        originalContent: "Check out our latest blog post",
        channel: "blog",
        contentFormat: "text",
        variationTypes: ["length-variant"],
        count: 1,
      };

      const result = service.generateVariations(params);

      expect(result[0].estimatedReach).toBeGreaterThan(0);
    });
  });

  describe("scoreViralPotential", () => {
    it("should return score between 0 and 100", () => {
      const params: ScoreViralPotentialParams = {
        caption: "Amazing content that will change your life!",
        hashtags: ["#trending", "#viral", "#socialmedia"],
        channel: "tiktok",
        contentFormat: "video",
        targetAudience: "Gen Z",
        contentGoal: "engagement",
      };

      const score = service.scoreViralPotential(params);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should give higher scores to video content on TikTok", () => {
      const tiktokVideoParams: ScoreViralPotentialParams = {
        caption: "Check this out!",
        hashtags: ["#fyp", "#viral"],
        channel: "tiktok",
        contentFormat: "video",
        targetAudience: "Teens",
        contentGoal: "engagement",
      };

      const blogTextParams: ScoreViralPotentialParams = {
        caption: "Check this out!",
        hashtags: ["#blog"],
        channel: "blog",
        contentFormat: "text",
        targetAudience: "Professionals",
        contentGoal: "traffic",
      };

      const tiktokScore = service.scoreViralPotential(tiktokVideoParams);
      const blogScore = service.scoreViralPotential(blogTextParams);

      // TikTok video should generally score higher than blog text
      expect(tiktokScore).toBeGreaterThan(blogScore);
    });

    it("should give bonus for optimal caption length", () => {
      const optimalCaption = "A".repeat(200); // Good length for Instagram
      const shortCaption = "Hi"; // Too short

      const optimalParams: ScoreViralPotentialParams = {
        caption: optimalCaption,
        hashtags: ["#test"],
        channel: "instagram",
        contentFormat: "image",
        targetAudience: "General",
        contentGoal: "awareness",
      };

      const shortParams: ScoreViralPotentialParams = {
        caption: shortCaption,
        hashtags: ["#test"],
        channel: "instagram",
        contentFormat: "image",
        targetAudience: "General",
        contentGoal: "awareness",
      };

      const optimalScore = service.scoreViralPotential(optimalParams);
      const shortScore = service.scoreViralPotential(shortParams);

      expect(optimalScore).toBeGreaterThan(shortScore);
    });
  });
});
