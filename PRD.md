---
repo: "uos-department-social-media"
display_name: "@uos/department-social-media"
package_name: "@uos/department-social-media"
lane: "department overlay"
artifact_class: "TypeScript package / business-domain overlay"
maturity: "domain overlay focused on content operations and platform learning"
generated_on: "2026-04-03"
assumptions: "Grounded in the current split-repo contents, package metadata, README/PRD alignment pass, and the Paperclip plugin scaffold presence where applicable; deeper module-level inspection should refine implementation detail as the code evolves."
autonomy_mode: "maximum-capability autonomous work with deep research and explicit learning loops"
---

# PRD: @uos/department-social-media

## 1. Product Intent

**Package / repo:** `@uos/department-social-media`  
**Lane:** department overlay  
**Artifact class:** TypeScript package / business-domain overlay  
**Current maturity:** domain overlay focused on content operations and platform learning  
**Source-of-truth assumption:** Department-specific social media overlay.
**Runtime form:** Split repo with package code as the source of truth and a Paperclip plugin scaffold available for worker, manifest, UI, and validation surfaces when the repo needs runtime or operator-facing behavior.

@uos/department-social-media turns content planning, publishing operations, performance analysis, and platform adaptation into an autonomous-friendly operating layer. It should help the team learn faster from content performance without compromising brand safety.

## 2. Problem Statement

Social platforms change quickly, performance signals are noisy, and teams often react with anecdotal tactics. This overlay should make social work experimental, measurable, and brand-safe rather than chaotic or trend-chasing.

## 3. Target Users and Jobs to Be Done

- Social media operators and content strategists.
- Brand/marketing leads reviewing channel health and campaigns.
- Autonomous agents generating briefs, experiments, and post-performance analysis.
- Cross-functional teams depending on social learnings.

## 4. Outcome Thesis

**North star:** Content operations become a compounding system: better briefs, faster experimentation, clearer channel learning, and stronger brand safety under platform volatility.

### 12-month KPI targets
- 100% of major campaigns or planned content batches have a brief and experiment hypothesis.
- Brand-safety and channel-fit review coverage reaches 100% for scheduled high-visibility content.
- Readouts are produced for >= 90% of top-reach posts or campaigns.
- Response time to material platform shifts or audience-signal changes stays <= 5 business days.
- Reusable performance patterns are extracted from >= 75% of campaigns with statistically meaningful outcomes.

### Acceptance thresholds for the next implementation wave
- A repeatable content brief and experiment structure exists for the maintained channels.
- Approval and brand-safety workflows are explicit enough to handle reactive moments safely.
- Performance readouts tie results back to hypotheses and not just vanity metrics.
- Platform shifts and moderation or risk changes can be escalated without improvising a new process every time.

## 5. In Scope

- Content planning, experiment design, and channel playbooks.
- Publishing workflow support and post-publication analysis.
- Performance synthesis and platform change adaptation.
- Brand-safety-aware review and escalation support.
- Learning loops that convert content outcomes into better briefs.

## 6. Explicit Non-Goals

- Treating every platform trend as a product requirement.
- Optimizing vanity metrics without business or brand context.
- Replacing human review for sensitive campaigns or crisis moments.

## 7. Maximum Tool and Connection Surface

- This repo should assume it may use any connection, API, browser flow, CLI, document surface, dataset, or storage system materially relevant to completing the job, as long as the access pattern is lawful, auditable, and proportionate to risk.
- Do not artificially limit execution to the tools already named in the repo if adjacent systems are clearly required to close the loop.
- Prefer first-party APIs and direct integrations when available, but use browser automation, provider CLIs, structured import/export, and human-review queues when they are the most reliable path to completion.
- Treat communication systems, docs, spreadsheets, issue trackers, code hosts, cloud consoles, dashboards, databases, and admin panels as valid operating surfaces whenever the repo's job depends on them.
- Escalate only when the action is irreversible, privacy-sensitive, financially material, or likely to create external side effects without adequate review.

### Priority surfaces for social media work
- X, LinkedIn, YouTube, TikTok, Instagram, Meta, scheduling tools, social analytics suites, asset libraries, Figma, Canva, CMS tools, and link/performance trackers needed to operate a real publishing system.
- Browser automation for creator-studio flows, moderation surfaces, ad consoles, or analytics views that are absent, delayed, or degraded in public APIs.
- Docs, spreadsheets, calendars, approval systems, chat, and DAM/asset-management surfaces when planning, review, and brand-safety workflows span people and agents.
- Any external surface required to connect planning, publishing, experimentation, moderation, ad spend, and performance learning end to end.

### Selection rules
- Start by identifying the systems that would let the repo complete the real job end to end, not just produce an intermediate artifact.
- Use the narrowest safe action for high-risk domains, but not the narrowest tool surface by default.
- When one system lacks the evidence or authority needed to finish the task, step sideways into the adjacent system that does have it.
- Prefer a complete, reviewable workflow over a locally elegant but operationally incomplete one.

## 8. Autonomous Operating Model

This PRD assumes **maximum-capability autonomous work**. The repo should not merely accept tasks; it should research deeply, compare options, reduce uncertainty, ship safely, and learn from every outcome. Autonomy here means higher standards for evidence, reversibility, observability, and knowledge capture—not just faster execution.

### Required research before every material task
1. Read the repo README, this PRD, touched source modules, existing tests, and recent change history before proposing a solution.
1. Trace impact across adjacent UOS repos and shared contracts before changing interfaces, schemas, or runtime behavior.
1. Prefer evidence over assumption: inspect current code paths, add repro cases, and study real failure modes before implementing a fix.
1. Use external official documentation and standards for any upstream dependency, provider API, framework, CLI, or format touched by the task.
1. For non-trivial work, compare at least two approaches and explicitly choose based on reversibility, operational safety, and long-term maintainability.

### Repo-specific decision rules
- Brand safety beats raw reach when the tradeoff matters.
- Treat content performance as an experiment system, not a vibes contest.
- Post-performance learning must feed future briefs and playbooks.
- Platform-specific nuance matters more than generic best-practice slogans.

### Mandatory escalation triggers
- Potential crises, sensitive topics, or legal/regulatory campaign concerns.
- Any high-visibility response or campaign with elevated reputation risk.
- Automation that could publish or respond without appropriate review.

## 9. Continuous Learning Requirements

### Required learning loop after every task
- Every completed task must leave behind at least one durable improvement: a test, benchmark, runbook, migration note, ADR, or automation asset.
- Capture the problem, evidence, decision, outcome, and follow-up questions in repo-local learning memory so the next task starts smarter.
- Promote repeated fixes into reusable abstractions, templates, linters, validators, or code generation rather than solving the same class of issue twice.
- Track confidence and unknowns; unresolved ambiguity becomes a research backlog item, not a silent assumption.
- Prefer instrumented feedback loops: telemetry, evaluation harnesses, fixtures, or replayable traces should be added whenever feasible.

### Repo-specific research agenda
- Which content patterns truly generalize by platform and which do not?
- How should performance be normalized across channels and campaign types?
- What early signals best predict both upside and brand risk?
- Which review steps improve quality versus simply add delay?
- How can learning from one channel transfer responsibly to another?

### Repo-specific memory objects that must stay current
- Channel playbook library.
- Experiment and post-analysis archive.
- Brand-risk casebook.
- Creative pattern index.
- Platform change watchlist.

## 10. Core Workflows the Repo Must Master

1. Designing channel-specific content briefs and experiments.
1. Reviewing content for channel fit and brand safety.
1. Analyzing post performance and extracting reusable patterns.
1. Responding to emerging platform shifts or audience signals.
1. Managing reactive social moments with clear escalation paths.

## 11. Interfaces and Dependencies

- Paperclip plugin scaffold for worker, manifest, UI, and validation surfaces.

- `@uos/core` for orchestration.
- Potential connectors to social or analytics systems.
- `@uos/department-growth-revenue` when social work contributes to acquisition or revenue goals.
- Brand/marketing governance inputs outside the repo.

## 12. Implementation Backlog

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

## 13. Risks and Mitigations

- Local maxima driven by one platform or one content style.
- Unsafe automation around publishing or reactive responses.
- Performance narratives based on noisy or incomplete data.
- Brand governance treated as a last-minute check instead of a design constraint.

## 14. Definition of Done

A task in this repo is only complete when all of the following are true:

- The code, configuration, or skill behavior has been updated with clear intent.
- Tests, evals, replay cases, or validation artifacts were added or updated to protect the changed behavior.
- Documentation, runbooks, or decision records were updated when the behavior, contract, or operating model changed.
- The task produced a durable learning artifact rather than only a code diff.
- Cross-repo consequences were checked wherever this repo touches shared contracts, orchestration, or downstream users.

### Repo-specific completion requirements
- Each workflow produces learning that improves future briefs or review rules.
- Brand safety implications are explicit and testable.
- Post-performance analysis distinguishes durable patterns from noise.

## 15. Recommended Repo-Local Knowledge Layout

- `/docs/research/` for research briefs, benchmark notes, and upstream findings.
- `/docs/adrs/` for decision records and contract changes.
- `/docs/lessons/` for task-by-task learning artifacts and postmortems.
- `/evals/` for executable quality checks, golden cases, and regression suites.
- `/playbooks/` for operator runbooks, migration guides, and incident procedures.
