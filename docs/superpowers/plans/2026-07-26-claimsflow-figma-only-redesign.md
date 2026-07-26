# ClaimsFlow Figma-Only Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Propagate the approved ClaimsFlow dark evidence-ledger system across the remaining editable Figma product pages.

**Architecture:** Reuse the Figma foundations, shell, panels, badges, KPI instruments, command bars, and row grammar. Each new page derives from one canonical frame rather than creating an independent dashboard style.

**Tech Stack:** Figma Design, editable frames/components, existing Angular design handoff.

## Global Constraints

- Do not change backend behavior or API contracts.
- Keep the grouped global navigation and retain Claims as globally active on claim-level pages.
- Retain text labels alongside status, priority, and SLA color signals.
- Use violet edge treatment, source evidence, confidence, missing information, and human actions for AI advice.

---

### Task 1: Propagate operator pages

**Files:**
- Modify: Figma pages `06 New Claim Flow`, `07 Communications`, `08 Payments & Recovery`

- [ ] Create each screen from the command-grid shell and its nearest canonical pattern.
- [ ] Add loading, empty, error, stale, and offline states where data is represented.
- [ ] Check sidebar order, 100% table readability, keyboard focus annotation, and reduced-motion notes.

### Task 2: Propagate intelligence and administration pages

**Files:**
- Modify: Figma pages `09 Analytics & Reports` through `16 Handoff Notes`

- [ ] Use the shared components for filters, panels, KPIs, badges, and inspector patterns.
- [ ] Keep AI surfaces provenance-backed and explicitly approval-gated.
- [ ] Add prototype links for claim intake, triage, evidence review, recommendation approval, and assignment.

### Task 3: Handoff QA

**Files:**
- Modify: Figma pages `14 Responsive & States`, `15 Prototype Flows`, `16 Handoff Notes`

- [ ] Verify every canonical frame has a dominant visualization and a shared shell.
- [ ] Verify editable nodes, named reusable components, and token documentation.
- [ ] Export frame links/screenshots for PR #4 and record implementation notes without merging.
