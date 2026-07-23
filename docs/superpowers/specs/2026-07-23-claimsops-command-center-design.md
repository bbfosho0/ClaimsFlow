# ClaimsOps Command Center Redesign

**Status:** Approved design specification  
**Date:** 2026-07-23  
**Repository:** `bbfosho0/ClaimsFlow`  
**Figma file:** https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y

## 1. Purpose

Revamp the ClaimsFlow Angular frontend into a polished enterprise operations interface that is visually distinctive, credible for insurance claims work, accessible, responsive, and suitable for a junior full-stack interview demonstration.

The redesign must improve visual hierarchy, scanability, interaction quality, and maintainability without changing the core claims workflow or inventing unsupported product capabilities.

The selected visual direction is **ClaimsOps Command Center**: a light operational workspace anchored by deep midnight navigation, controlled teal and cyan accents, strong risk signaling, compact information density, and restrained motion.

## 2. Goals

1. Make the application look production-oriented rather than like an MVP.
2. Improve claims triage and queue scanning speed.
3. Make the claim workspace the visual and functional centerpiece.
4. Present decision support clearly while preserving mandatory human review.
5. Establish a reusable design system shared by Figma and Angular.
6. Preserve existing routes, API contracts, forms, validation, and business logic.
7. Maintain strong keyboard, focus, contrast, and responsive behavior.
8. Reduce duplicated inline CSS and oversized inline templates.

## 3. Non-goals

The redesign will not:

- Add authentication, roles, or real operator profiles.
- Add unsupported backend sorting, saved searches, notifications, charts, or analytics.
- Add file upload behavior.
- Present deterministic fallback output as OpenAI-generated.
- Change claim state-transition rules.
- Change recommendation approval or rejection semantics.
- Replace Angular with another frontend framework.
- Add a large UI component framework solely for visual convenience.
- Introduce decorative effects that reduce readability or enterprise credibility.

## 4. Existing application boundaries

The current frontend includes these routes:

- `/dashboard`
- `/claims`
- `/claims/new`
- `/claims/:id`

The redesign must preserve:

- Angular standalone components.
- Existing route-level lazy loading.
- Existing typed API services and models.
- Signals and RxJS data loading.
- Reactive Forms and current validation constraints.
- Current loading, error, empty, success, and disabled states.
- URL-backed claims queue filters.
- Human review of recommendations.
- Audit timeline behavior.

The backend remains the authority for completeness, priority, status transitions, assignments, recommendation generation, and audit events.

## 5. Visual direction

### 5.1 Brand character

ClaimsFlow should feel:

- Precise
- Calm
- Operational
- Trustworthy
- Technically modern
- Data-aware
- Human-governed

It should not feel like a consumer fintech app, a cyberpunk console, or a generic admin template.

### 5.2 Color system

Primary palette:

- Midnight navigation: `#071B2E`
- Navigation elevated surface: `#0D2942`
- Workspace background: `#F3F7FA`
- Primary surface: `#FFFFFF`
- Secondary surface: `#EAF1F5`
- Primary text: `#102235`
- Muted text: `#607286`
- Border: `#D5E0E8`
- Teal primary: `#0A8478`
- Cyan accent: `#27C7B8`

Semantic palette:

- Informational blue: `#2F6FED`
- Success green: `#15815D`
- Warning amber: `#B66A09`
- Critical red: `#B93832`
- Neutral gray: `#64748B`

Every semantic state must use text or iconography in addition to color.

### 5.3 Typography

Use Inter or the existing system-compatible sans-serif stack.

Recommended scale:

- Display page title: 32/40, 700
- Section title: 20/28, 700
- Card title: 16/24, 700
- Body: 14/22, 400
- Operational label: 12/16, 700, uppercase where appropriate
- Metric value: 30-38px, 700
- Table text: 13-14px

Typography must prioritize data density and readability over oversized marketing-style headings.

### 5.4 Spacing and geometry

Use an 8-point spacing system with 4px for fine adjustments.

Primary radii:

- Small control: 8px
- Standard card: 12px
- Elevated command panel: 16px
- Pills and badges: full radius

Shadows should be restrained and used to communicate elevation, not decoration.

## 6. Application shell

### 6.1 Desktop

Use a persistent 248px left sidebar containing:

- ClaimsFlow brand mark
- `Operations Intelligence` workspace label
- Overview navigation
- Claims navigation
- New claim navigation
- Lower utility region
- System-status treatment
- Current demo operator treatment

The active route should use a high-contrast filled state with a subtle cyan edge or glow. Hover states should be visible but subdued.

The main workspace should use a maximum readable width where appropriate while allowing the claims queue to expand wider.

### 6.2 Tablet and mobile

At narrower widths:

- Replace the fixed sidebar with a compact top application bar.
- Keep primary navigation accessible without hidden hover interactions.
- Avoid a hamburger-only design for the three primary destinations where space permits.
- Convert dense action rails into sticky bottom or inline action regions.
- Avoid horizontal page overflow.

### 6.3 System status

The shell may display a generic `Decision support available` state only if it can be derived without claiming provider provenance.

Do not display `OpenAI active` or `Fallback active` unless the backend later exposes reliable provider metadata.

## 7. Dashboard design

### 7.1 Header

The dashboard header will include:

- `Operations dashboard` title
- Short operational summary
- Current date or context label
- Primary `Create claim` action
- Subtle command-center background treatment

The background may use a restrained gradient, grid, or radial highlight. It must remain readable and must not require image assets.

### 7.2 Metrics

Display five current metrics:

- Open claims
- High priority
- SLA risk
- Unassigned
- Incomplete

The metrics should not all receive equal visual emphasis.

- SLA risk and high-priority metrics use stronger semantic signaling.
- Open claims is the leading volume metric.
- Unassigned and incomplete remain actionable but visually quieter.

Each metric card should include:

- Label
- Value
- Small semantic icon
- Brief contextual phrase derived from the existing metric only

Do not add percentage changes or trends unless the backend supplies historical data.

### 7.3 Operational modules

Use the currently available data for:

- Adjuster workload
- Recent activity

Workload should use horizontal utilization bars with accessible numeric text.

Recent activity should use a compact vertical event stream with differentiated event markers.

Do not fabricate workflow distribution, recommendation counts, or ranked attention lists without backend support. These may be represented in Figma as future-capability annotations only, not as implemented UI.

## 8. Claims queue design

### 8.1 Filter region

Use a compact command toolbar containing:

- Search
- Status
- Priority
- Assignment
- Apply
- Reset

After filters are applied, show removable visual filter chips where this can be implemented using the existing URL-backed filter state.

Do not introduce unsupported filters.

### 8.2 Table

Desktop table requirements:

- Sticky header within the table region
- Strong claim-number link hierarchy
- Claimant as supporting identity
- Claim type
- Priority badge
- Status badge
- Assignment
- SLA deadline or readable time pressure
- Completeness progress treatment

Rows should have:

- Clear hover state
- Visible keyboard focus on the primary claim link
- Adequate row height
- No color-only meaning

The table should remain a semantic HTML table.

### 8.3 SLA display

The frontend may derive a readable countdown from the existing deadline, such as:

- `Due in 5h`
- `Due tomorrow`
- `3d remaining`

The exact timestamp remains available through visible text or an accessible label.

### 8.4 Completeness

Replace plain percentage-only rendering with:

- Small progress bar or ring
- Numeric percentage
- Clear accessible label

### 8.5 Mobile queue

At mobile widths, transform rows into structured cards while preserving all important fields and a clear route to the claim workspace.

## 9. Claim intake design

### 9.1 Structure

Keep one Angular reactive form and one submit operation.

Visually divide it into four guided sections:

1. Claimant
2. Incident
3. Evidence
4. Review and submit

This is a visual progression, not a multi-page wizard.

### 9.2 Desktop layout

Use:

- Main form column
- Sticky summary or progress column
- Clear section numbering
- Section-level descriptions
- Grouped fields with helper text

The sticky summary may show only information derivable from current form state, such as:

- Completed required fields
- Selected claim type
- Evidence items marked present

It must not predict authoritative backend priority or completeness.

### 9.3 Claim type

Claim type may be presented as large selectable cards while remaining backed by the existing `claimType` form control.

Each option should include:

- Label
- Small icon
- One-line description

### 9.4 Evidence

Represent evidence flags as selectable cards rather than plain checkbox rows.

Each card must still use an actual checkbox or equivalent accessible control.

### 9.5 Validation

Preserve:

- Error-summary focus behavior
- Required-field validation
- Email validation
- Future-date rejection
- Estimated-loss minimum
- Description length rules
- Disabled submitting state
- Server error feedback

Inline errors may be added, but the summary must remain.

## 10. Claim workspace design

### 10.1 Header

The claim workspace header should display:

- Back navigation
- Claim number
- Claimant name
- Claim type and incident date
- Priority badge
- Status badge
- SLA deadline or countdown
- Completeness visualization
- Assigned adjuster when present

### 10.2 Layout

Desktop uses:

- Main content column
- Sticky contextual action rail

Main content contains:

- Claim overview
- Incident description
- Evidence and triage
- Priority factors
- Decision support
- Audit timeline

The action rail contains:

- Assignment
- Status transition
- Contextual operation feedback

### 10.3 Claim overview

Use a compact facts grid for:

- Email
- Estimated loss
- SLA
- Completeness
- Created or updated metadata where useful and already available

### 10.4 Evidence and triage

Use an evidence matrix that clearly distinguishes:

- Present evidence
- Missing evidence

Missing evidence receives warning emphasis. Complete evidence receives a quieter success state.

Priority factors should explain why the claim received its current priority without implying editable scoring.

### 10.5 Decision support

The decision-support panel must show:

- Recommended action
- Explanation
- Confidence
- Missing-information list
- Review state
- Reviewer when available
- Approve and reject actions for pending recommendations

The panel must include a clear statement that the recommendation is advisory and requires human review.

Do not label the recommendation as OpenAI-generated because the current response model does not expose provider provenance and the backend may use deterministic fallback.

Confidence should be visualized with both a bar or ring and numeric percentage.

Approve and reject actions must be visually distinct and must not rely on color alone.

### 10.6 Audit timeline

Use a structured timeline with distinct markers for:

- Claim creation
- Assignment
- Status transitions
- Recommendation generation
- Recommendation review

Display actor, timestamp, summary, and value transition where present.

Do not collapse or hide audit data by default.

## 11. Shared UI primitives

The implementation should create focused reusable primitives where they reduce duplication:

- App shell navigation item
- Button styles and variants
- Status badge
- Priority badge
- Metric card
- Progress indicator
- Form field presentation
- Panel or command surface
- Empty state
- Alert or inline feedback
- Timeline item

Avoid over-componentizing one-off layout fragments.

## 12. Angular structure

Move large inline templates and styles into external files for the major page components:

- `app-shell.component.html` / `.css`
- `dashboard-page.component.html` / `.css`
- `claims-queue-page.component.html` / `.css`
- `new-claim-page.component.html` / `.css`
- `claim-detail-page.component.html` / `.css`

Introduce global design tokens in `frontend/src/styles.css` using CSS custom properties.

Keep component behavior in the existing TypeScript classes unless a focused presentational component is introduced.

Do not add a global state-management library.

## 13. Motion and interaction

Use restrained motion for:

- Page-entry fade and translate
- Metric reveal
- Progress changes
- Hover elevation
- Filter-chip appearance
- Action feedback

Animation duration should generally stay between 120ms and 280ms.

Respect `prefers-reduced-motion: reduce` and remove nonessential animation in that mode.

Do not use continuous decorative motion.

## 14. Accessibility requirements

- Preserve the skip link.
- Maintain semantic headings.
- Keep the claims queue as a semantic table on desktop.
- Ensure all form controls have programmatic labels.
- Maintain visible keyboard focus indicators.
- Use text and icons in addition to color.
- Meet WCAG AA contrast for normal text and controls.
- Use appropriate live regions or status roles for loading and action feedback.
- Preserve focus movement to the form error summary.
- Ensure sticky regions do not obscure focused controls.
- Ensure mobile layouts work at 320px width.

## 15. Figma deliverables

The Figma file will contain:

### Page 1: Foundations

- Color variables
- Typography styles
- Spacing scale
- Radius scale
- Elevation guidance
- Icon guidance
- Accessibility notes

### Page 2: Components

- Buttons
- Navigation items
- Badges
- Metric cards
- Form controls
- Evidence selectors
- Progress indicators
- Alerts
- Timeline items
- Command panels

### Page 3: Desktop screens

- Operations dashboard
- Claims queue
- New claim intake
- Claim workspace

### Page 4: Responsive screens

- Mobile dashboard
- Mobile claims queue
- Mobile claim intake
- Mobile claim workspace

### Page 5: Annotations

- Responsive behavior
- Interaction states
- Accessibility notes
- Angular mapping notes

All core frames should use Auto Layout and reusable components where practical.

## 16. Testing strategy

### Existing tests

All current frontend tests must continue to pass.

### Additions

Add focused tests for behavior introduced by the redesign, such as:

- Filter chip removal updates query parameters.
- SLA formatter handles urgent, future, and expired states.
- Mobile and desktop markup retains accessible labels where testable.
- Claim type card selection updates the reactive form.
- Evidence card selection updates checkbox controls.
- Recommendation review controls preserve disabled and pending behavior.

Do not write tests that assert fragile pixel values or implementation-specific class names unless required.

### Verification

Required commands:

```bash
cd frontend
npm ci
npm run test:ci
npm run build
```

GitHub Actions must pass before merge.

## 17. Implementation sequence

1. Build Figma foundations and components.
2. Design desktop dashboard and queue.
3. Design desktop intake and claim workspace.
4. Design responsive variants.
5. Review Figma screens for accessibility and unsupported data.
6. Add global CSS variables and shared primitives.
7. Refactor application shell.
8. Refactor dashboard.
9. Refactor queue.
10. Refactor intake.
11. Refactor claim workspace.
12. Add focused tests.
13. Run frontend verification.
14. Review the implementation against Figma.
15. Open a pull request with screenshots and verification evidence.

## 18. Acceptance criteria

The redesign is complete when:

- All four routes have approved desktop and mobile Figma designs.
- The Angular implementation closely matches the Figma designs.
- No existing API contract or workflow behavior is broken.
- No unsupported data is displayed as real.
- Recommendation provenance is not misrepresented.
- The interface is usable with keyboard navigation.
- The layout works at 320px, tablet, laptop, and large-desktop widths.
- Existing and newly added tests pass.
- The production Angular build passes.
- GitHub Actions is green.
- The final pull request includes design links, screenshots, scope, and verification details.
