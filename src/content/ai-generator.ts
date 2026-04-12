/**
 * AI Content Generator Service
 * Provides mock LLM-powered content generation for social media briefs,
 * captions, variations, and viral potential scoring.
 */

import type {
  SocialChannel,
  ContentFormat,
  ContentGoal,
  ContentBrief,
} from "../types.js";

// ============================================
// Input/Output Types
// ============================================

export interface GenerateBriefParams {
  topic: string;
  targetAudience: string;
  channel: SocialChannel;
  contentFormat: ContentFormat;
  contentGoals: ContentGoal[];
  keyMessages?: string[];
  campaignName?: string;
}

export interface AIGeneratedContent {
  title: string;
  description: string;
  topic: string;
  keyMessages: string[];
  suggestedHashtags: string[];
  targetAudience: string;
  contentGoals: ContentGoal[];
  draftCaption: string;
  suggestedTiming?: string;
  confidenceScore: number;
}

export interface GenerateCaptionParams {
  topic: string;
  channel: SocialChannel;
  contentFormat: ContentFormat;
  keyMessage?: string;
  includeHashtags: boolean;
  tone?: "professional" | "casual" | "humorous" | "inspirational" | "informative";
}

export interface GenerateCaptionResult {
  caption: string;
  hashtags: string[];
}

export interface ContentVariation {
  id: string;
  content: string;
  variationType: "tone-shift" | "length-variant" | "format-change" | "audience-adjustment";
  description: string;
  estimatedReach: number;
}

export interface GenerateVariationsParams {
  originalContent: string;
  channel: SocialChannel;
  contentFormat: ContentFormat;
  variationTypes: ContentVariation["variationType"][];
  count?: number;
}

export interface ScoreViralPotentialParams {
  caption: string;
  hashtags: string[];
  channel: SocialChannel;
  contentFormat: ContentFormat;
  targetAudience: string;
  contentGoal: ContentGoal;
  postedAt?: string;
}

// ============================================
// Deterministic Mock LLM
// ============================================

/**
 * Mock LLM that generates deterministic outputs based on input hash.
 * No real API calls - purely deterministic for testing.
 */
class MockLLM {
  private seed: number;

  constructor(seed: number = 42) {
    this.seed = seed;
  }

  private hash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash + this.seed);
  }

  private random(max: number, offset: number = 0): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return (this.seed >>> 16) % max + offset;
  }

  private pickRandom<T>(items: T[], seed: string): T {
    const index = this.hash(seed) % items.length;
    return items[index];
  }

  private generateWords(base: string, count: number, seed: string): string[] {
    const words: string[] = [];
    const baseWords = base.split(" ");
    for (let i = 0; i < count; i++) {
      const wordIndex = this.hash(seed + i) % baseWords.length;
      words.push(baseWords[wordIndex]);
    }
    return words;
  }

  generateBriefContent(params: GenerateBriefParams): AIGeneratedContent {
    const seed = `${params.topic}-${params.channel}-${params.contentFormat}`;
    
    const tones: Record<SocialChannel, string> = {
      x: "concise and punchy",
      instagram: "visually descriptive and engaging",
      youtube: "detailed and educational",
      tiktok: "short-form and trend-aware",
      facebook: "community-focused and conversational",
      linkedin: "professional and thought-provoking",
      reddit: "authentic and discussion-oriented",
      blog: "comprehensive and SEO-friendly",
    };

    const titlePrefixes = ["Discover", "Learn", "Explore", "Master", "Unlock"];
    const titleSuffixes = ["Guide", "Tips", "Insights", "Strategies", "Best Practices"];

    const title = `${this.pickRandom(titlePrefixes, seed + "prefix")} ${params.topic} ${this.pickRandom(titleSuffixes, seed + "suffix")}`;
    
    const tone = tones[params.channel];
    const description = `A ${params.contentFormat} ${tone} piece about ${params.topic} targeting ${params.targetAudience}.`;
    
    const keyMessages = params.keyMessages?.length 
      ? params.keyMessages 
      : this.generateWords(params.topic, 3, seed + "msgs");
    
    const hashtagBase = ["trending", "viral", "social", "content", params.channel, params.topic.replace(/\s+/g, "")];
    const suggestedHashtags = hashtagBase.slice(0, 5 + (this.hash(seed) % 5)).map(
      (tag, i) => `#${tag}${i > 0 ? (i * 17) % 100 : ""}`
    );

    const draftCaption = `✨ ${params.topic} ✨\n\n${tone.charAt(0).toUpperCase() + tone.slice(1)} content you don't want to miss!\n\n${keyMessages.slice(0, 2).join(". ")}.`;

    return {
      title,
      description,
      topic: params.topic,
      keyMessages,
      suggestedHashtags,
      targetAudience: params.targetAudience,
      contentGoals: params.contentGoals,
      draftCaption,
      suggestedTiming: this.generateTimingSuggestion(params.channel, seed),
      confidenceScore: 0.75 + (this.hash(seed + "conf") % 20) / 100,
    };
  }

  generateCaption(params: GenerateCaptionParams): GenerateCaptionResult {
    const seed = `${params.topic}-${params.channel}-${params.contentFormat}-${params.tone || "default"}`;
    
    const toneIntros: Record<string, string[]> = {
      professional: ["Let's discuss", "Insights on", "Key takeaways from"],
      casual: ["Hey everyone!", "So excited to share", "Quick thought:"],
      humorous: ["Plot twist:", "You won't believe", "Fun fact:"],
      inspirational: ["Dream big:", "Believe in", "Remember:"],
      informative: ["Here's what you need to know", "The facts about", "Understanding"],
    };

    const intros = toneIntros[params.tone || "casual"];
    const intro = intros[this.hash(seed) % intros.length];
    
    const emojiMap: Record<string, string[]> = {
      x: ["🔥", "💯", "✨", "👀"],
      instagram: ["📸", "💫", "✨", "❤️", "🙌"],
      youtube: ["🎬", "▶️", "💡", "📺"],
      tiktok: ["💃", "🎵", "😂", "🔥", "✨"],
      facebook: ["👋", "❤️", "✨", "🙏"],
      linkedin: ["💼", "📈", "🎯", "💡"],
      reddit: ["📊", "💬", "🤔", "⬆️"],
      blog: ["📝", "📚", "💻", "🎓"],
    };

    const emojis = emojiMap[params.channel] || ["✨"];
    const emojiStr = emojis.slice(0, 2 + (this.hash(seed + "emoji") % 3)).join("");
    
    const keyMessage = params.keyMessage || params.topic;
    
    const ctaPhrases = [
      "What do you think?",
      "Learn more via link in bio",
      "Share your thoughts below",
      "Double tap if you agree",
      "Tag someone who needs this",
    ];
    
    const caption = `${emojiStr} ${intro} ${keyMessage}!\n\n${ctaPhrases[this.hash(seed + "cta") % ctaPhrases.length]}`;
    
    const hashtagLimit = params.channel === "instagram" ? 30 
      : params.channel === "x" ? 10 
      : 15;
    
    const hashtagBase = [
      params.topic.replace(/\s+/g, ""),
      params.channel,
      params.contentFormat,
      "viral",
      "trending",
      "socialmedia",
      "content",
    ];
    
    const hashtags = params.includeHashtags
      ? hashtagBase.slice(0, hashtagLimit).map((tag, i) => {
          const suffix = i > 0 ? (this.hash(seed + tag) % 999).toString() : "";
          return `#${tag}${suffix}`;
        })
      : [];

    return { caption, hashtags };
  }

  generateVariations(params: GenerateVariationsParams): ContentVariation[] {
    const count = params.count || 3;
    const variations: ContentVariation[] = [];
    
    for (let i = 0; i < count; i++) {
      const variationType = params.variationTypes[i % params.variationTypes.length];
      const seed = `${params.originalContent}-${variationType}-${i}`;
      
      const reachFactors: Record<ContentVariation["variationType"], number> = {
        "tone-shift": 0.85,
        "length-variant": 0.95,
        "format-change": 0.75,
        "audience-adjustment": 0.80,
      };

      let content = "";
      let description = "";
      const baseReach = 1000 + this.hash(seed + "reach") % 5000;

      switch (variationType) {
        case "tone-shift":
          content = `[Tone-shifted] ${params.originalContent.substring(0, Math.min(50, params.originalContent.length))}...`;
          description = "Version adapted for different emotional resonance";
          break;
        case "length-variant":
          content = params.originalContent.length > 100
            ? params.originalContent.substring(0, 100) + "..."
            : params.originalContent + " [Extended version]";
          description = params.originalContent.length > 100
            ? "Condensed for shorter attention spans"
            : "Expanded with more detail";
          break;
        case "format-change":
          content = `[Format: ${params.contentFormat}] ${params.originalContent}`;
          description = `Adapted for ${params.contentFormat} format optimization`;
          break;
        case "audience-adjustment":
          content = `[Audience-adjusted] ${params.originalContent}`;
          description = "Tailored messaging for broader appeal";
          break;
      }

      variations.push({
        id: `var-${this.hash(seed)}`,
        content,
        variationType,
        description,
        estimatedReach: Math.floor(baseReach * (reachFactors[variationType] || 1)),
      });
    }

    return variations;
  }

  scoreViralPotential(params: ScoreViralPotentialParams): number {
    const seed = `${params.caption}-${params.hashtags.join("-")}-${params.channel}`;
    let score = 50; // Base score

    // Hashtag diversity bonus (up to +15)
    const uniqueHashtags: Record<string, boolean> = {};
    params.hashtags.forEach(h => {
      const normalized = h.replace(/[0-9]/g, "");
      uniqueHashtags[normalized] = true;
    });
    const uniqueCount = Object.keys(uniqueHashtags).length;
    score += Math.min(15, uniqueCount * 3);

    // Channel-specific adjustments
    const channelVirality: Record<SocialChannel, number> = {
      tiktok: 15,
      x: 10,
      instagram: 12,
      youtube: 8,
      facebook: 5,
      linkedin: 3,
      reddit: 7,
      blog: 2,
    };
    score += channelVirality[params.channel] || 5;

    // Format bonuses
    const formatVirality: Record<ContentFormat, number> = {
      video: 15,
      reel: 14,
      story: 8,
      carousel: 10,
      image: 7,
      text: 2,
      thread: 6,
      live: 5,
      link: 1,
    };
    score += formatVirality[params.contentFormat] || 5;

    // Goal alignment
    if (params.contentGoal === "engagement" || params.contentGoal === "awareness") {
      score += 10;
    }

    // Caption length optimization (optimal range varies by channel)
    const optimalLengths: Record<SocialChannel, [number, number]> = {
      x: [100, 280],
      instagram: [150, 2000],
      youtube: [200, 5000],
      tiktok: [50, 150],
      facebook: [100, 500],
      linkedin: [150, 3000],
      reddit: [100, 1000],
      blog: [500, 10000],
    };
    
    const [minLen, maxLen] = optimalLengths[params.channel] || [100, 1000];
    if (params.caption.length >= minLen && params.caption.length <= maxLen) {
      score += 10;
    } else if (params.caption.length < minLen) {
      score -= 5;
    }

    // Posted time factor (deterministic based on seed)
    if (params.postedAt) {
      const hour = new Date(params.postedAt).getHours();
      // Prime posting hours bonus
      if (hour >= 9 && hour <= 11 || hour >= 19 && hour <= 21) {
        score += 5;
      }
    }

    // Deterministic variance based on seed
    const variance = this.hash(seed) % 20 - 10;
    score += variance;

    // Normalize to 0-100 range
    return Math.max(0, Math.min(100, Math.floor(score)));
  }

  private generateTimingSuggestion(channel: SocialChannel, seed: string): string {
    const optimalTimes: Record<SocialChannel, string[]> = {
      x: ["9:00 AM", "12:00 PM", "5:00 PM"],
      instagram: ["11:00 AM", "1:00 PM", "7:00 PM"],
      youtube: ["2:00 PM", "6:00 PM", "8:00 PM"],
      tiktok: ["7:00 AM", "12:00 PM", "9:00 PM"],
      facebook: ["1:00 PM", "3:00 PM", "8:00 PM"],
      linkedin: ["8:00 AM", "12:00 PM", "5:00 PM"],
      reddit: ["6:00 AM", "12:00 PM", "10:00 PM"],
      blog: ["9:00 AM", "6:00 PM"],
    };
    
    const times = optimalTimes[channel] || ["12:00 PM"];
    return times[this.hash(seed + "time") % times.length] + " UTC";
  }
}

// ============================================
// Service Class
// ============================================

export class AIContentGeneratorService {
  private llm: MockLLM;

  constructor(seed?: number) {
    this.llm = new MockLLM(seed);
  }

  /**
   * Generate a complete content brief with AI suggestions
   */
  generateBrief(params: GenerateBriefParams): AIGeneratedContent {
    return this.llm.generateBriefContent(params);
  }

  /**
   * Generate a caption with optional hashtags
   */
  generateCaption(params: GenerateCaptionParams): GenerateCaptionResult {
    return this.llm.generateCaption(params);
  }

  /**
   * Generate multiple variations of content
   */
  generateVariations(params: GenerateVariationsParams): ContentVariation[] {
    return this.llm.generateVariations(params);
  }

  /**
   * Score the viral potential of content (0-100)
   */
  scoreViralPotential(params: ScoreViralPotentialParams): number {
    return this.llm.scoreViralPotential(params);
  }
}

// Default export for convenience
export default AIContentGeneratorService;
