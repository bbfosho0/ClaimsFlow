# Midnight Violet Operations — Implementation Status

This branch implements the approved Midnight Violet Operations design system while preserving ClaimsFlow's existing role-aware workflows and authority boundaries.

## Motion and utility boundaries

- Tailwind CSS v4 is an opt-in composition layer with Preflight disabled.
- AutoAnimate is limited to lists, filters, messages, and other child collections that enter, leave, or reorder.
- GSAP is limited to scoped signature reveals. Every animation is component-scoped, reverted on destruction, and replaced with an immediate final state when reduced motion is requested.
- Violet communicates product identity and advisory context. Amber and rose remain reserved for approaching and breached service-level deadlines.

## Product boundaries

- Operational KPIs are backend-derived and deterministic under the demo clock.
- At risk means an open claim due within 24 hours.
- Overdue means an open claim past its persisted deadline.
- Recommendations remain advisory and require explicit human review.
- Workflow drafts, validation, and simulation remain local only. Production activation is not connected.
- Evidence Operations represents persisted evidence presence, not binary object storage.

## Verification gate

The branch is not complete until backend verification, frontend source audit and tests, production build, expanded Visual QA, reduced-motion capture, and manual artifact inspection all pass on the same exact head.
