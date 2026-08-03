# ClaimsFlow “Midnight Violet Operations” Design Brief and Implementation Plan

> **Implementation baseline:** `main` after PR #8, merge commit `cda9c23e315b514ba256f3e8f63bdd954d2c963d`.
>
> **Required workflow:** use Superpowers test-driven execution. Preserve role-aware routes, backend authority, deterministic demo behavior, human authority boundaries, stale-data retention, accessibility, and reduced motion.

## Goal

Redesign ClaimsFlow’s KPI and data-visualization system around a premium violet-led operational language while preserving all existing workflows and truthfulness boundaries.

## SLA terminology

- **SLA deadline at risk:** an open claim due within the next 24 hours.
- **Overdue claim:** an open claim whose deadline has passed.
- **SLA compliance:** resolved claims completed on or before their deadline.
- **SLA pressure:** at-risk plus overdue open claims.

Use the labels **SLA deadlines at risk**, **Open claims due within 24 hours**, **Overdue claims**, and **Resolved on or before deadline**. Never use “At Risk SLA.”

## Design direction

### Midnight Violet Operations

- Violet is brand atmosphere, selected state, primary chart series, and primary action.
- Cyan means live or recently changed.
- Mint means healthy, complete, or resolved.
- Amber means approaching deadline or incomplete evidence.
- Rose means overdue, blocked, or critical.
- Tables remain first-class work surfaces.
- One meaningful signature visualization per data-heavy page.
- Motion explains changes only; no permanently floating or pulsing cards.
- No hard-coded calculated-looking scores.
- AI remains contextual, evidence-grounded, and advisory.

## Global visual tokens

```css
--cf-color-canvas: #07050d;
--cf-color-canvas-raised: #0b0813;
--cf-color-navigation: #0d0918;
--cf-color-surface-default: #110d1c;
--cf-color-surface-elevated: #171125;
--cf-color-surface-strong: #1e1631;
--cf-color-surface-hover: #261c3d;
--cf-color-border-hairline: #2b2242;
--cf-color-border-subtle: #382b50;
--cf-color-border-strong: #574173;
--cf-color-text-primary: #f7f4ff;
--cf-color-text-secondary: #b9aecf;
--cf-color-text-muted: #7f7497;
--cf-color-text-dim: #625874;
--cf-color-brand-violet: #8b5cf6;
--cf-color-brand-lilac: #a78bfa;
--cf-color-intelligence: #d8b4fe;
--cf-color-live: #22d3ee;
--cf-color-success: #34d399;
--cf-color-warning: #fbbf24;
--cf-color-critical: #fb7185;
--cf-color-info: #60a5fa;
```

Typography remains Inter. KPI values use tabular numerals. Page title 36/40, section title 18/24, hero KPI 40/42, compact KPI 28/32, body 13/20, meaningful text never below 11px.

Motion: KPI 220ms, sparkline 260ms, chart 280ms, hover 140ms up to -2px, inspector 200ms, changed-row 1200ms, live breathing 2200ms opacity only, one-cycle critical pulse 720ms. Reduced motion disables number counting, chart drawing, breathing, translation, and orbiting.

## Shared KPI system

Create Hero, Compact, Split, and Radial metric cards with loading, refresh, changed, stale, no-data, and error states. Delta semantics: New, Cleared, No change, or percentage. Lower risk/overdue/resolution time is positive; higher compliance/readiness/coverage is positive. Tooltips name both periods and exact values.

## Shared SVG visualization system

Create accessible Angular SVG components for line/area, horizontal bars, stacked strips, distribution ring, heatmap, workload matrix, evidence matrix, and reasoning flow. Every chart has title, subtitle, keyboard-focusable marks, exact tooltip, `<title>/<desc>`, hidden exact-value table, empty state, stale support, reduced-motion behavior, deterministic dimensions, and optional click-to-filter.

## Page map

### Operations Overview

Hero cards: Open Claims, Estimated Exposure, SLA Pressure split, Evidence Readiness radial. Signature chart: Portfolio Pulse with active inventory, created, and resolved. Additional surfaces: Intervention Queue, SLA Deadline Profile, Team Capacity, Evidence Readiness Bands, Priority Mix, Event Feed. Remove Command Field from the primary operational page; retain only in showcase/tour unless each mark maps to a real claim.

### Claim Queue

Compact cards: Matching Claims, SLA Deadlines at Risk, Overdue Claims, Unassigned Claims. Keep the table dominant; add urgency rails, monospace claim IDs, SLA progress, evidence meter, sticky header, and sticky inspector. Mobile filters use a drawer and inspector uses a bottom sheet.

### My Work

Cards: Assigned Claims, Due Within 24 Hours, Evidence Blocked, Capacity Utilization radial. Signature visualization: Personal Work Timeline. Ranked Next Actions. Group claims into Now, Today, Later.

### Operational Analytics

Hero cards: Estimated Exposure, Claim Volume, Average Resolution Time, SLA Compliance radial. Charts: Volume & Inventory, Status Composition, Resolution by Claim Type, Exposure by Claim Type, Priority Mix, Open-Claim Aging, Evidence Readiness Bands, Resolution Cohort Heatmap.

### Team Operations

Hero cards: Active Workload, Capacity Utilization radial, SLA Compliance, Overdue Claims. Signature visualization: Adjuster Load Matrix. Add SLA by Team, Work Mix, Integrity Components, Capacity Trend, and ranked Escalations. The integrity formula remains explicit.

### Evidence Operations

Cards: Claims Missing Evidence, Average Readiness radial, SLA Risk with Evidence Gap, Fully Complete. Signature visualization: Evidence Completeness Matrix. Keep selected evidence context and claimant-visible communication truthful.

### Claim Workspace

Header instruments: Estimated Loss, SLA Deadline, Evidence Completeness radial, Owner/Capacity. Preserve dossier, evidence, communications, and audit. Add evidence-to-rules-to-recommendation reasoning flow. Remove the hard-coded 88% policy-alignment display unless a real backend rule evaluation exists; recommended action is removal.

### Intelligence Review Center

Cards: Pending Reviews, Low Confidence, Evidence Blocked, Reviewed Today. Preserve 3/6/3 queue/dossier/assistant workbench. Add a contextual Reasoning Flow and confidence distribution.

### Workflow Automation

Cards: Draft State, Validation Result, Nodes/Conditions, Last Local Simulation. Preserve local-only boundary. Implement, remove, or explicitly disable every inert control.

### New Claim and Claimant Portal

No operational analytics. Use compact progress/readiness instruments only. Keep claimant surfaces calmer and lower-glow.

## Required backend contracts

Extend Dashboard with exposure, utilization, resolved count, comparisons, portfolio/exposure/SLA trends, evidence bands, priority distribution, and SLA deadline bands.

Add filtered Queue summary using the complete filtered result set.

Add dedicated My Work snapshot with capacity, workload, due/overdue/evidence counts, timeline, trend, and claims.

Extend Analytics with open portfolio trend, resolution by claim type, exposure by claim type, and evidence readiness bands. Use null for unavailable averages.

Extend Team Operations rows with risk, overdue, priority, evidence, and next deadline; add team priority mix, team SLA performance, and capacity trend.

Extend Evidence summaries with category state and KPI summary.

Add Intelligence summary only if the Intelligence page is implemented in the same phase.

## Implementation phases

1. Visual tokens and shared KPI/chart primitives.
2. Backend aggregate contracts.
3. Overview, Analytics, and Team Operations.
4. Queue, My Work, Evidence Operations, and Claim Workspace.
5. Intelligence, Workflow, New Claim, and claimant polish.
6. Responsive/accessibility hardening, expanded Visual QA, README/demo documentation.

## Verification

```bash
cd backend
mvn verify
```

```bash
cd frontend
npm ci
npm run audit:source:test
npm run audit:source
npm run test:ci
npm run build
```

Visual QA must cover desktop, tablet/mobile, filtered, no-data, stale, and reduced-motion states. It must assert route/query, one `<h1>`, required content, no loading/alerts, zero console errors, zero browser exceptions, zero unexpected API failures, screenshot integrity, and expected visual differences.

## Acceptance criteria

1. Overview, Analytics, and Team Operations share one premium KPI system.
2. Purple is clearly brand atmosphere without replacing semantic warning/critical colors.
3. Every KPI has a definition and denominator.
4. At-risk and overdue are always separate.
5. Filtered portfolio metrics use the full filtered set.
6. Queue remains the dominant triage surface.
7. Forms and claimant pages are not overloaded with charts.
8. Every chart answers a meaningful operational question and exposes exact values accessibly.
9. No hard-coded calculated-looking score remains.
10. AI remains evidence-grounded and human-controlled.
11. Every visible control works, navigates, or explains why it is disabled.
12. Exact-head backend, frontend, build, source audit, and Visual QA pass.
