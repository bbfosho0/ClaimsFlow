# Tailwind, AutoAnimate, and GSAP Integration Amendment

## Goal

Extend the approved Midnight Violet Operations design with a controlled utility and motion layer without rewriting the established ClaimsFlow component system.

## Architecture

### Tailwind CSS v4

Tailwind is an opt-in composition layer. Use utilities for responsive grid, flex, spacing, typography, visibility, and breakpoint behavior in newly redesigned templates. Existing semantic design tokens, panel surfaces, form controls, charts, status colors, and complex component styling remain in authored CSS.

- Use Tailwind CSS `4.3.3` and `@tailwindcss/postcss` `4.3.3`.
- Disable Preflight by importing Tailwind theme and utilities without the base reset.
- Map utilities to existing CSS variables instead of duplicating semantic color definitions.
- Do not perform a repository-wide class migration.

### AutoAnimate

Use `@formkit/auto-animate` `0.10.0` on bounded collection parents whose direct children enter, leave, or reorder.

Approved targets:

- intervention and escalation lists,
- claim queue rows/cards,
- ranked My Work actions,
- evidence matrix rows,
- filter chips,
- claimant-visible messages,
- loading/empty/content transitions.

Do not apply AutoAnimate to entire pages, SVG chart internals, forms while typing, or continuously updating metric values.

### GSAP

Use GSAP `3.15.0` only for motion requiring explicit orchestration.

Approved targets:

- initial KPI reveal,
- signature chart entrance,
- inspector and mobile-sheet entrance/exit,
- evidence-to-rules reasoning flow,
- single-cycle critical emphasis,
- workflow simulation path,
- existing copilot orb when state changes.

Each component must create motion through a shared scoped helper, use `gsap.context()` or `gsap.matchMedia()`, respect `prefers-reduced-motion`, and revert all contexts on destruction. Do not add ScrollTrigger, smooth scrolling, infinite card motion, or broad route-transition choreography.

## Error and accessibility boundaries

- If animation setup fails, the content remains fully rendered and interactive.
- Reduced-motion mode skips transforms and numeric/chart drawing; opacity changes may remain instantaneous.
- AutoAnimate must not reorder DOM semantics or interfere with focus.
- GSAP must never hide meaningful content from assistive technology.
- All motion-enhanced controls retain keyboard-visible focus.

## Testing

- Dependency/build test through `npm ci`, frontend tests, and production build.
- Unit tests for reduced-motion branching and GSAP context cleanup.
- Unit tests for AutoAnimate directive presence only on approved bounded parents.
- Visual QA captures normal and reduced-motion states.
- Source audit rejects ScrollTrigger and page-wide AutoAnimate usage.

## Acceptance criteria

1. Tailwind utilities coexist with existing CSS without Preflight regressions.
2. No existing page is rewritten solely to increase Tailwind usage.
3. AutoAnimate is limited to approved collection boundaries.
4. GSAP contexts are scoped and reverted.
5. Reduced-motion Visual QA shows no transforms, drawing, breathing, or sequencing.
6. CI and exact-head Visual QA pass.
