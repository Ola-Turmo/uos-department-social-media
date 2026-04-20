/**
 * Social Media Command Center Dashboard
 * Multi-platform social media management with content calendar,
 * performance analytics, trend detection, and crisis management.
 */

import { useState } from "react";
import * as React from "react";
import { usePluginAction, usePluginData, type PluginPageProps, type PluginWidgetProps } from "@paperclipai/plugin-sdk/ui";
import type {
  ConnectorHealthSummary,
  ContentBrief,
  ContentBriefWorkflowState,
  SocialChannel,
  ReusablePattern,
  EscalationPath,
} from "../types.js";

// ─── Types ─────────────────────────────────────────────────────────────────

type TabId = "overview" | "content" | "performance" | "trends" | "crisis";

type HealthData = {
  status: "ok" | "degraded" | "error";
  checkedAt: string;
  hasLimitations?: boolean;
  limitations?: string[];
};

type ContentData = {
  briefId: string;
  channel: SocialChannel;
  campaign: string;
  goals: string[];
  keyMessage: string;
  targetAudience: string;
  hashtags: string[];
  createdAt: string;
  status: "draft" | "in_review" | "approved" | "published" | "rejected";
  score?: number;
};

type MetricsData = {
  totalPosts: number;
  thisWeek: number;
  engagementRate: number;
  topChannel: string;
  followerGrowth: number;
  activeEscalations: number;
  pendingBriefs: number;
};

type PatternData = {
  patternId: string;
  patternType: string;
  description: string;
  confidence: number;
  channel: SocialChannel;
  lastUsed: string;
};

type EscalationData = {
  escalationId: string;
  severity: "low" | "medium" | "high" | "critical";
  trigger: string;
  status: "active" | "resolved";
  createdAt: string;
  affectedChannel?: SocialChannel;
};

// ─── Channel Badge ───────────────────────────────────────────────────────────

const CHANNEL_COLORS: Record<string, string> = {
  x: "#000000",
  instagram: "#E4405F",
  youtube: "#FF0000",
  tiktok: "#000000",
  reddit: "#FF4500",
  facebook: "#1877F2",
  hubspot: "#FF7A59",
  mailchimp: "#FFE01B",
};

function ChannelBadge({ channel }: { channel: SocialChannel }) {
  const color = CHANNEL_COLORS[channel] ?? "#666";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: 600,
        background: color,
        color: channel === "x" || channel === "tiktok" ? "#fff" : "#fff",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {channel}
    </span>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    draft: { bg: "#f3f4f6", text: "#374151" },
    in_review: { bg: "#fef3c7", text: "#92400e" },
    approved: { bg: "#d1fae5", text: "#065f46" },
    published: { bg: "#dbeafe", text: "#1e40af" },
    rejected: { bg: "#fee2e2", text: "#991b1b" },
    active: { bg: "#fee2e2", text: "#991b1b" },
    resolved: { bg: "#d1fae5", text: "#065f46" },
    ok: { bg: "#d1fae5", text: "#065f46" },
    degraded: { bg: "#fef3c7", text: "#92400e" },
    error: { bg: "#fee2e2", text: "#991b1b" },
  };
  const c = colors[status] ?? { bg: "#f3f4f6", text: "#374151" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: 600,
        background: c.bg,
        color: c.text,
        textTransform: "capitalize",
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
        {value}
        {trend === "up" && <span style={{ fontSize: "16px", color: "#059669" }}>↑</span>}
        {trend === "down" && <span style={{ fontSize: "16px", color: "#dc2626" }}>↓</span>}
      </div>
      {sub && <div style={{ fontSize: "12px", color: "#9ca3af" }}>{sub}</div>}
    </div>
  );
}

// ─── Connector Health Panel ──────────────────────────────────────────────────

function ConnectorHealthPanel({ data }: { data: HealthData }) {
  const connectors: Array<{ name: string; status: "ok" | "degraded" | "error" }> = [
    { name: "facebook", status: "ok" },
    { name: "instagram", status: "ok" },
    { name: "youtube", status: "ok" },
    { name: "tiktok", status: "ok" },
    { name: "reddit", status: data.status === "degraded" ? "degraded" : "ok" },
    { name: "x", status: "ok" },
    { name: "hubspot", status: "ok" },
    { name: "mailchimp", status: "ok" },
  ];

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "16px",
      }}
    >
      <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px", color: "#111827" }}>
        Connector Health
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
        {connectors.map((c) => (
          <div
            key={c.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 8px",
              background: "#f9fafb",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background:
                  c.status === "ok" ? "#10b981" : c.status === "degraded" ? "#f59e0b" : "#ef4444",
              }}
            />
            <span style={{ fontSize: "11px", color: "#374151", textTransform: "capitalize" }}>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ health }: { health: HealthData | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
        <MetricCard label="Posts This Week" value={12} trend="up" sub="vs 9 last week" />
        <MetricCard label="Avg Engagement" value="4.7%" trend="up" sub="vs 3.2% last week" />
        <MetricCard label="Follower Growth" value="+847" trend="up" sub="this month" />
        <MetricCard label="Active Escalations" value={2} trend="down" sub="1 resolved today" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
        <ConnectorHealthPanel data={health ?? { status: "ok", checkedAt: "" }} />

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px", color: "#111827" }}>
            Top Performing Content
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { title: "Behind the scenes at HQ", channel: "instagram" as SocialChannel, score: 98 },
              { title: "Product launch announcement", channel: "x" as SocialChannel, score: 94 },
              { title: "Customer testimonial video", channel: "youtube" as SocialChannel, score: 89 },
            ].map((post, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px",
                  background: "#f9fafb",
                  borderRadius: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ChannelBadge channel={post.channel} />
                  <span style={{ fontSize: "12px", color: "#374151" }}>{post.title}</span>
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: post.score >= 95 ? "#059669" : "#374151",
                  }}
                >
                  {post.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Content Tab ─────────────────────────────────────────────────────────────

const CONTENT_SAMPLES: ContentData[] = [
  {
    briefId: "brief-001",
    channel: "x",
    campaign: "Product Launch Q2",
    goals: ["awareness", "engagement"],
    keyMessage: "Announcing our most requested feature",
    targetAudience: "Tech founders, 25-45",
    hashtags: ["#ProductLaunch", "#Innovation"],
    createdAt: "2026-04-10T09:00:00Z",
    status: "in_review",
    score: 72,
  },
  {
    briefId: "brief-002",
    channel: "instagram",
    campaign: "Customer Stories",
    goals: ["brand_trust", "engagement"],
    keyMessage: "Real results from real customers",
    targetAudience: "Marketing leaders, 30-50",
    hashtags: ["#CustomerSuccess", "#SaaS"],
    createdAt: "2026-04-09T14:30:00Z",
    status: "approved",
    score: 88,
  },
  {
    briefId: "brief-003",
    channel: "youtube",
    campaign: "How-To Series",
    goals: ["education", "retention"],
    keyMessage: "Step-by-step guide to getting started",
    targetAudience: "New users, 22-40",
    hashtags: ["#Tutorial", "#GettingStarted"],
    createdAt: "2026-04-08T11:00:00Z",
    status: "draft",
  },
  {
    briefId: "brief-004",
    channel: "tiktok",
    campaign: "Behind the Scenes",
    goals: ["awareness", "community"],
    keyMessage: "Meet the team building the product",
    targetAudience: "Gen-Z/Millennials, 18-30",
    hashtags: ["#TeamLife", "#StartupLife"],
    createdAt: "2026-04-07T16:00:00Z",
    status: "published",
    score: 91,
  },
];

const CHANNELS: SocialChannel[] = ["x", "instagram", "youtube", "tiktok", "reddit", "facebook"];

function ContentTab() {
  const [selectedChannel, setSelectedChannel] = useState<SocialChannel | "all">("all");
  const [showCreate, setShowCreate] = useState(false);
  const createBrief = usePluginAction("content.createBrief");
  const submitBrief = usePluginAction("content.submitForReview");

  const filtered = selectedChannel === "all"
    ? CONTENT_SAMPLES
    : CONTENT_SAMPLES.filter((b) => b.channel === selectedChannel);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Filter + Create bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", ...CHANNELS].map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch as SocialChannel | "all")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: selectedChannel === ch ? "#3b82f6" : "#d1d5db",
                background: selectedChannel === ch ? "#eff6ff" : "#fff",
                color: selectedChannel === ch ? "#1d4ed8" : "#374151",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {ch}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background: "#3b82f6",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + New Brief
        </button>
      </div>

      {/* Create Brief Form */}
      {showCreate && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          <div>
            <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>Campaign Name</label>
            <input
              type="text"
              placeholder="e.g. Product Launch Q2"
              style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>Channel</label>
            <select style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px" }}>
              {CHANNELS.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>Key Message</label>
            <input
              type="text"
              placeholder="The core message of this content..."
              style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>Target Audience</label>
            <input
              type="text"
              placeholder="e.g. Tech founders, 25-45"
              style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowCreate(false)}
              style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: "13px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={() => setShowCreate(false)}
              style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Save Draft
            </button>
          </div>
        </div>
      )}

      {/* Briefs Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Campaign", "Channel", "Status", "Score", "Created", "Actions"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((brief) => (
              <tr key={brief.briefId} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{brief.campaign}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{brief.keyMessage}</div>
                </td>
                <td style={{ padding: "10px 12px" }}><ChannelBadge channel={brief.channel} /></td>
                <td style={{ padding: "10px 12px" }}><StatusBadge status={brief.status} /></td>
                <td style={{ padding: "10px 12px" }}>
                  {brief.score !== undefined ? (
                    <span style={{ fontSize: "13px", fontWeight: 700, color: brief.score >= 85 ? "#059669" : "#374151" }}>
                      {brief.score}
                    </span>
                  ) : (
                    <span style={{ color: "#9ca3af" }}>—</span>
                  )}
                </td>
                <td style={{ padding: "10px 12px", fontSize: "12px", color: "#6b7280" }}>
                  {new Date(brief.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {brief.status === "draft" && (
                      <button
                        onClick={() => void submitBrief({ briefId: brief.briefId })}
                        style={{ padding: "4px 10px", borderRadius: "4px", border: "1px solid #3b82f6", background: "#eff6ff", color: "#1d4ed8", fontSize: "11px", cursor: "pointer" }}
                      >
                        Submit
                      </button>
                    )}
                    <button style={{ padding: "4px 10px", borderRadius: "4px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: "11px", cursor: "pointer" }}>
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Performance Tab ─────────────────────────────────────────────────────────

const PERFORMANCE_DATA = [
  { channel: "instagram", posts: 24, engagement: 5.2, followers: 12847, impressions: 89420 },
  { channel: "youtube", posts: 8, engagement: 4.8, followers: 5234, impressions: 41230 },
  { channel: "x", posts: 45, engagement: 3.1, followers: 8932, impressions: 156700 },
  { channel: "tiktok", posts: 12, engagement: 7.4, followers: 15230, impressions: 234100 },
  { channel: "reddit", posts: 6, engagement: 2.9, followers: 2104, impressions: 34500 },
];

const TOP_POSTS = [
  { title: "Behind the scenes at HQ", channel: "instagram" as SocialChannel, engagement: 892, type: "carousel" },
  { title: "Product launch thread", channel: "x" as SocialChannel, engagement: 1204, type: "thread" },
  { title: "Customer success story", channel: "youtube" as SocialChannel, engagement: 2103, type: "video" },
  { title: "Day in the life of our dev team", channel: "tiktok" as SocialChannel, engagement: 3421, type: "video" },
  { title: "How to get started guide", channel: "reddit" as SocialChannel, engagement: 445, type: "text" },
];

function PerformanceTab() {
  const maxEngagement = Math.max(...TOP_POSTS.map((p) => p.engagement));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Channel comparison */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>
          Channel Performance Overview
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
          {PERFORMANCE_DATA.map((ch) => (
            <div key={ch.channel} style={{ textAlign: "center", padding: "12px 8px", background: "#f9fafb", borderRadius: "8px" }}>
              <ChannelBadge channel={ch.channel as SocialChannel} />
              <div style={{ marginTop: "8px", fontSize: "20px", fontWeight: 700, color: "#111827" }}>
                {ch.engagement}%
              </div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>engagement</div>
              <div style={{ fontSize: "12px", color: "#374151", marginTop: "4px" }}>{ch.posts} posts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Posts */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>
          Top Performing Posts
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {TOP_POSTS.map((post, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#9ca3af", width: "20px", textAlign: "center" }}>
                {i + 1}
              </div>
              <ChannelBadge channel={post.channel} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", color: "#111827", fontWeight: 500 }}>{post.title}</div>
                <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "capitalize" }}>{post.type}</div>
              </div>
              {/* Bar */}
              <div style={{ flex: 2, background: "#f3f4f6", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(post.engagement / maxEngagement) * 100}%`,
                    background: "#3b82f6",
                    borderRadius: "4px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", width: "60px", textAlign: "right" }}>
                {post.engagement.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Trends Tab ──────────────────────────────────────────────────────────────

const TRENDING = [
  { tag: "#ProductLaunch", posts: 1247, trend: "+24%", category: "Product" },
  { tag: "#AIAssistants", posts: 892, trend: "+18%", category: "Technology" },
  { tag: "#StartupLife", posts: 2103, trend: "+12%", category: "Lifestyle" },
  { tag: "#RemoteWork", posts: 654, trend: "+8%", category: "Work" },
  { tag: "#CustomerSuccess", posts: 432, trend: "+31%", category: "Business" },
  { tag: "#TechTwitter", posts: 3201, trend: "+5%", category: "Community" },
];

const VIRAL_OPPORTUNITIES = [
  { topic: "How AI is changing SaaS pricing", score: 94, window: "48h" },
  { topic: "Behind our product redesign", score: 87, window: "24h" },
  { topic: "Unpopular opinions about growth", score: 81, window: "72h" },
];

function TrendsTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
      {/* Trending hashtags */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>
          Trending Hashtags
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {TRENDING.map((t) => (
            <div
              key={t.tag}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                background: "#f9fafb",
                borderRadius: "6px",
              }}
            >
              <div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#3b82f6" }}>{t.tag}</span>
                <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "8px" }}>{t.category}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>{t.posts.toLocaleString()} posts</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#059669" }}>{t.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Viral opportunities */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>
          Viral Potential Opportunities
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {VIRAL_OPPORTUNITIES.map((v, i) => (
            <div
              key={i}
              style={{
                padding: "12px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{v.topic}</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: v.score >= 90 ? "#059669" : "#374151",
                  }}
                >
                  {v.score}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div
                  style={{
                    height: "4px",
                    flex: 1,
                    background: "#e5e7eb",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${v.score}%`,
                      background: v.score >= 90 ? "#059669" : "#3b82f6",
                      borderRadius: "2px",
                    }}
                  />
                </div>
                <span style={{ fontSize: "11px", color: "#6b7280", marginLeft: "8px" }}>
                  window: {v.window}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#374151",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Scan for More Opportunities
        </button>
      </div>
    </div>
  );
}

// ─── Crisis Tab ──────────────────────────────────────────────────────────────

const ESCALATIONS: EscalationData[] = [
  {
    escalationId: "esc-001",
    severity: "high",
    trigger: "Sentiment crash detected: -32% positive mentions",
    status: "active",
    createdAt: "2026-04-12T08:00:00Z",
    affectedChannel: "x",
  },
  {
    escalationId: "esc-002",
    severity: "medium",
    trigger: "Moderation flag spike on Instagram post",
    status: "active",
    createdAt: "2026-04-12T06:30:00Z",
    affectedChannel: "instagram",
  },
  {
    escalationId: "esc-003",
    severity: "critical",
    trigger: "Viral negative review gaining traction",
    status: "resolved",
    createdAt: "2026-04-11T14:00:00Z",
    affectedChannel: "youtube",
  },
];

function CrisisTab() {
  const createEscalation = usePluginAction("escalation.create");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Sentiment Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
        <MetricCard label="Overall Sentiment" value="68%" sub="positive mentions" trend="down" />
        <MetricCard label="Active Escalations" value={2} sub="requiring attention" />
        <MetricCard label="Crisis Resolution" value="94%" sub="resolved within 4h SLA" trend="up" />
      </div>

      {/* Escalation List */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>
          Active & Recent Escalations
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {ESCALATIONS.map((esc) => {
            const severityColors = {
              low: { bg: "#fef3c7", text: "#92400e" },
              medium: { bg: "#fed7aa", text: "#9a3412" },
              high: { bg: "#fee2e2", text: "#991b1b" },
              critical: { bg: "#7f1d1d", text: "#ffffff" },
            };
            const sc = severityColors[esc.severity];
            return (
              <div
                key={esc.escalationId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  borderLeft: `4px solid ${sc.bg === "#fef3c7" ? "#f59e0b" : sc.bg === "#fed7aa" ? "#ea580c" : sc.bg === "#fee2e2" ? "#ef4444" : "#7f1d1d"}`,
                }}
              >
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 700,
                    background: sc.bg,
                    color: sc.text,
                    textTransform: "uppercase",
                    minWidth: "60px",
                    textAlign: "center",
                  }}
                >
                  {esc.severity}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: "#111827" }}>{esc.trigger}</div>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                    {esc.affectedChannel && <ChannelBadge channel={esc.affectedChannel} />}
                    <span style={{ marginLeft: "8px" }}>{new Date(esc.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <StatusBadge status={esc.status} />
                {esc.status === "active" && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => void createEscalation({ channel: esc.affectedChannel, severity: esc.severity, trigger: esc.trigger })}
                      style={{ padding: "4px 10px", borderRadius: "4px", border: "1px solid #3b82f6", background: "#eff6ff", color: "#1d4ed8", fontSize: "11px", cursor: "pointer" }}
                    >
                      Respond
                    </button>
                    <button style={{ padding: "4px 10px", borderRadius: "4px", border: "1px solid #10b981", background: "#d1fae5", color: "#065f46", fontSize: "11px", cursor: "pointer" }}>
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Widget ──────────────────────────────────────────────────

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "content", label: "Content" },
  { id: "performance", label: "Performance" },
  { id: "trends", label: "Trends" },
  { id: "crisis", label: "Crisis" },
];

function SocialCommandCenterSurface({
  activeTab,
  setActiveTab,
  healthData,
  ping,
  minHeight,
}: {
  activeTab: TabId;
  setActiveTab(next: TabId): void;
  healthData: HealthData | null;
  ping: () => Promise<unknown> | unknown;
  minHeight: string;
}) {
  return (
    <div style={{ minHeight, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
            Social Media Command Center
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Multi-platform analytics, content, trends, and crisis operations
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <StatusBadge status={healthData?.status ?? "unknown"} />
          <button
            onClick={() => void ping()}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              background: "#fff",
              color: "#374151",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Ping
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          padding: "0 16px",
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 16px",
              border: "none",
              background: "none",
              borderBottom: `2px solid ${activeTab === tab.id ? "#3b82f6" : "transparent"}`,
              color: activeTab === tab.id ? "#3b82f6" : "#6b7280",
              fontSize: "13px",
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px", background: "#f9fafb", minHeight: "400px" }}>
        {activeTab === "overview" && <OverviewTab health={healthData} />}
        {activeTab === "content" && <ContentTab />}
        {activeTab === "performance" && <PerformanceTab />}
        {activeTab === "trends" && <TrendsTab />}
        {activeTab === "crisis" && <CrisisTab />}
      </div>
    </div>
  );
}

function SummarySection(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "14px",
        display: "grid",
        gap: "10px",
      }}
    >
      <div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{props.title}</div>
        {props.subtitle ? <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{props.subtitle}</div> : null}
      </div>
      {props.children}
    </div>
  );
}

export function DashboardWidget(_props: PluginWidgetProps) {
  const { data: healthData } = usePluginData<HealthData>("health");
  const ping = usePluginAction("ping");
  const contentStatusCounts = CONTENT_SAMPLES.reduce<Record<string, number>>((acc, brief) => {
    acc[brief.status] = (acc[brief.status] ?? 0) + 1;
    return acc;
  }, {});
  const activeEscalations = ESCALATIONS.filter((esc) => esc.status === "active");
  const bestChannel = [...PERFORMANCE_DATA].sort((a, b) => b.engagement - a.engagement)[0];
  const topOpportunity = [...VIRAL_OPPORTUNITIES].sort((a, b) => b.score - a.score)[0];

  return (
    <div style={{ minHeight: "420px", display: "grid", gap: "14px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          padding: "14px 16px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          background: "#fff",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: "4px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>Social Media Command Center</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Cleaner dashboard summary. Open the full company page for the heavier workflow.
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
            <StatusBadge status={healthData?.status ?? "unknown"} />
            <span style={{ fontSize: "11px", color: "#6b7280" }}>
              {healthData?.checkedAt ? `Checked ${new Date(healthData.checkedAt).toLocaleTimeString()}` : "No recent health check"}
            </span>
          </div>
        </div>
        <button
          onClick={() => void ping()}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#374151",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Ping
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
        <MetricCard label="Posts This Week" value={12} trend="up" sub="vs 9 last week" />
        <MetricCard label="Avg Engagement" value="4.7%" trend="up" sub="cross-channel" />
        <MetricCard label="Best Channel" value={bestChannel.channel.toUpperCase()} sub={`${bestChannel.engagement}% engagement`} />
        <MetricCard label="Active Escalations" value={activeEscalations.length} trend={activeEscalations.length > 0 ? "down" : "neutral"} sub="watch list" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
        <SummarySection title="Content Pipeline" subtitle="Compact queue so the dashboard stays readable">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
            {[
              ["Draft", contentStatusCounts.draft ?? 0],
              ["Review", contentStatusCounts.in_review ?? 0],
              ["Approved", contentStatusCounts.approved ?? 0],
              ["Published", contentStatusCounts.published ?? 0],
            ].map(([label, count]) => (
              <div key={label} style={{ padding: "10px", borderRadius: "8px", background: "#f9fafb", border: "1px solid #eef2f7" }}>
                <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginTop: "4px" }}>{count}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gap: "8px" }}>
            {CONTENT_SAMPLES.slice(0, 3).map((brief) => (
              <div key={brief.briefId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", padding: "8px 10px", background: "#f9fafb", borderRadius: "8px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{brief.campaign}</div>
                  <div style={{ fontSize: "11px", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{brief.keyMessage}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <ChannelBadge channel={brief.channel} />
                  <StatusBadge status={brief.status} />
                </div>
              </div>
            ))}
          </div>
        </SummarySection>

        <SummarySection title="Channel Momentum" subtitle="What deserves attention first">
          <div style={{ display: "grid", gap: "10px" }}>
            {PERFORMANCE_DATA.slice().sort((a, b) => b.engagement - a.engagement).slice(0, 4).map((channel) => (
              <div key={channel.channel} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: "10px" }}>
                <ChannelBadge channel={channel.channel as SocialChannel} />
                <div style={{ height: "8px", background: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(channel.engagement * 12, 100)}%`, height: "100%", background: "#3b82f6" }} />
                </div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>{channel.engagement}%</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 12px", borderRadius: "8px", background: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: "11px", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Top opportunity</div>
            <div style={{ marginTop: "4px", fontSize: "13px", fontWeight: 700, color: "#111827" }}>{topOpportunity.topic}</div>
            <div style={{ marginTop: "4px", fontSize: "12px", color: "#475569" }}>
              Score {topOpportunity.score} · window {topOpportunity.window}
            </div>
          </div>
        </SummarySection>

        <SummarySection title="Risk & Connectors" subtitle="Enough signal for the dashboard without the full control room">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
            {[
              { label: "Connectors", value: "8 live" },
              { label: "Escalations", value: `${activeEscalations.length} active` },
              { label: "Followers", value: "+847" },
              { label: "Growth", value: "+12%" },
            ].map((item) => (
              <div key={item.label} style={{ padding: "10px", borderRadius: "8px", background: "#f9fafb", border: "1px solid #eef2f7" }}>
                <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px" }}>{item.label}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginTop: "4px" }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gap: "8px" }}>
            {activeEscalations.slice(0, 2).map((esc) => (
              <div key={esc.escalationId} style={{ display: "grid", gap: "4px", padding: "10px 12px", borderRadius: "8px", background: "#fff7ed", border: "1px solid #fdba74" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#9a3412", textTransform: "uppercase" }}>{esc.severity}</div>
                  {esc.affectedChannel ? <ChannelBadge channel={esc.affectedChannel} /> : null}
                </div>
                <div style={{ fontSize: "12px", color: "#7c2d12" }}>{esc.trigger}</div>
              </div>
            ))}
            <div style={{ fontSize: "11px", color: "#6b7280" }}>
              Full command center page includes the detailed tabs for content, performance, trends, and crisis operations.
            </div>
          </div>
        </SummarySection>
      </div>
    </div>
  );
}

export function SocialMediaCommandCenterPage(_props: PluginPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { data: healthData } = usePluginData<HealthData>("health");
  const ping = usePluginAction("ping");

  return (
    <div style={{ padding: "16px", background: "#f8fafc" }}>
      <div style={{ maxWidth: "1480px", margin: "0 auto" }}>
        <SocialCommandCenterSurface
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          healthData={healthData ?? null}
          ping={() => ping()}
          minHeight="720px"
        />
      </div>
    </div>
  );
}
