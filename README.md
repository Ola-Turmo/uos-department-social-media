# @uos/department-social-media

@uos/department-social-media turns content planning, publishing operations, performance analysis, and platform adaptation into an autonomous-friendly operating layer. It should help the team learn faster from content performance without compromising brand safety.

Built as part of the UOS split workspace on top of [Paperclip](https://github.com/paperclipai/paperclip), which remains the upstream control-plane substrate.

## What This Repo Owns

- Content planning, experiment design, and channel playbooks.
- Publishing workflow support and post-publication analysis.
- Performance synthesis and platform change adaptation.
- Brand-safety-aware review and escalation support.
- Learning loops that convert content outcomes into better briefs.

## Runtime Form

- Split repo with package code as the source of truth and a Paperclip plugin scaffold available for worker, manifest, UI, and validation surfaces when the repo needs runtime or operator-facing behavior.

## Highest-Value Workflows

- Designing channel-specific content briefs and experiments.
- Reviewing content for channel fit and brand safety.
- Analyzing post performance and extracting reusable patterns.
- Responding to emerging platform shifts or audience signals.
- Managing reactive social moments with clear escalation paths.

## Key Connections and Operating Surfaces

- X, LinkedIn, YouTube, TikTok, Instagram, Meta, scheduling tools, social analytics suites, asset libraries, Figma, Canva, CMS tools, and link/performance trackers needed to operate a real publishing system.
- Browser automation for creator-studio flows, moderation surfaces, ad consoles, or analytics views that are absent, delayed, or degraded in public APIs.
- Docs, spreadsheets, calendars, approval systems, chat, and DAM/asset-management surfaces when planning, review, and brand-safety workflows span people and agents.
- Any external surface required to connect planning, publishing, experimentation, moderation, ad spend, and performance learning end to end.

## KPI Targets

- 100% of major campaigns or planned content batches have a brief and experiment hypothesis.
- Brand-safety and channel-fit review coverage reaches 100% for scheduled high-visibility content.
- Readouts are produced for >= 90% of top-reach posts or campaigns.
- Response time to material platform shifts or audience-signal changes stays <= 5 business days.

## Implementation Backlog

### Now
- Standardize channel briefs, approval steps, and brand-safety review for the first wave of active channels.
- Build a readout template that turns content performance into reusable patterns and operating decisions.
- Define the reactive-social escalation playbook for fast-moving platform events.

### Next
- Improve experiment design so channel adaptations can be compared more causally across time.
- Integrate asset creation, scheduling, and analytics surfaces more tightly into one workflow.
- Measure whether platform-specific adjustments actually improve durable reach and engagement.

### Later
- Support more autonomous campaign operations with hard guardrails for brand and platform risk.
- Expand into cross-channel portfolio management and budget-aware social planning.

## Local Plugin Use

```bash
curl -X POST http://127.0.0.1:3100/api/plugins/install \
  -H "Content-Type: application/json" \
  -d '{"packageName":"<absolute-path-to-this-repo>","isLocalPath":true}'
```

## Validation

```bash
npm install
npm run check
npm run plugin:typecheck
npm run plugin:test
```
