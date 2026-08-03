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

- [x] Create each screen from the command-grid shell and its nearest canonical pattern.
- [x] Add loading, empty, error, stale, and offline states where data is represented.
- [x] Check sidebar order, 100% table readability, keyboard focus annotation, and reduced-motion notes.

### Task 2: Propagate intelligence and administration pages

**Files:**
- Modify: Figma pages `09 Analytics & Reports` through `16 Handoff Notes`

- [x] Use the shared components for filters, panels, KPIs, badges, and inspector patterns.
- [x] Keep AI surfaces provenance-backed and explicitly approval-gated.
- [x] Add a clickable intake → triage → evidence-review Figma prototype flow with 180ms dissolve transitions.

### Task 3: Handoff QA

**Files:**
- Modify: Figma pages `14 Responsive & States`, `15 Prototype Flows`, `16 Handoff Notes`

- [x] Verify every canonical frame has a dominant visualization and a shared shell.
- [x] Verify editable nodes, named reusable components, and token documentation.
- [x] Record Figma links and implementation notes in PR #4 without merging.
