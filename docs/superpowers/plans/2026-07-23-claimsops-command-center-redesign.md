# ClaimsOps Command Center Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ClaimsFlow MVP presentation with a polished, responsive ClaimsOps Command Center design in Figma and Angular while preserving every existing route, API contract, validation rule, workflow, and human-review safeguard.

**Architecture:** Figma file `jVmP142OtufkQZvNk8VE6y` is the visual source of truth for tokens, reusable components, desktop screens, responsive screens, and annotations. Angular 20 remains a standalone, lazy-routed application; global CSS custom properties provide design tokens, focused standalone presentation components remove repeated badge/progress/empty-state markup, and the existing feature-page classes retain data loading and workflow behavior. Derived presentation logic such as SLA labels is implemented as pure, independently tested TypeScript rather than embedded in templates.

**Tech Stack:** Figma Design and Plugin API, Angular 20.3 standalone components, TypeScript 5.8, Angular Reactive Forms, signals, RxJS 7.8, HTML, CSS custom properties, Jasmine, Karma, ChromeHeadless, GitHub Actions.

## Global Constraints

- Preserve `/dashboard`, `/claims`, `/claims/new`, and `/claims/:id` exactly.
- Preserve Angular standalone components, route-level lazy loading, typed API services, signals, RxJS, and Reactive Forms.
- Do not add authentication, roles, real operator profiles, file uploads, notifications, saved searches, unsupported filtering, backend sorting, or fabricated analytics.
- Do not change backend APIs, claim transitions, recommendation review semantics, assignment behavior, or audit behavior.
- Never label every recommendation as OpenAI-generated; the backend can use deterministic fallback and the current response does not expose provenance.
- Keep one claim-intake form and one submit operation; the four sections are visual progression, not a multi-route wizard.
- Keep the claims queue as a semantic HTML table on desktop and expose equivalent structured content on mobile.
- Use text or iconography in addition to semantic color.
- Meet WCAG AA contrast for normal text and controls and remain usable at 320px viewport width.
- Preserve the skip link, programmatic labels, visible focus, loading/error/empty states, and focus movement to the intake error summary.
- Use restrained 120–280ms motion and disable nonessential motion under `prefers-reduced-motion: reduce`.
- Do not add a UI framework, global state library, charting library, icon package, or runtime dependency solely for presentation.
- Use inline SVGs or CSS geometry for the small icon set so the production bundle remains self-contained.
- Figma and Angular use the approved palette and 8-point spacing system from the design specification.
- Use `npm ci`, `npm run test:ci`, and `npm run build` for final verification.
- Work on an isolated implementation branch or worktree created from `design/claimsops-command-center`; never commit feature code directly to `main`.

---

## File Structure

### Figma

- File: `https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y`
- Page `01 Foundations`: variables, type scale, spacing, radius, elevation, accessibility notes.
- Page `02 Components`: navigation, buttons, badges, progress, metric tiles, form controls, evidence selectors, alerts, timeline items, command panels.
- Page `03 Desktop Screens`: dashboard, queue, intake, claim workspace at 1440px width.
- Page `04 Responsive Screens`: the same four routes at 390px width, plus one 768px shell reference.
- Page `05 Annotations`: responsive rules, state matrix, supported-data notes, Angular file mapping.

### Angular files to create

- `frontend/src/app/shared/presentation/label.util.ts`: convert enum-like values to human-readable labels.
- `frontend/src/app/shared/presentation/sla-display.ts`: derive accessible SLA urgency labels from a deadline and reference time.
- `frontend/src/app/shared/presentation/sla-display.spec.ts`: pure SLA presentation tests.
- `frontend/src/app/shared/ui/status-badge/status-badge.component.ts`
- `frontend/src/app/shared/ui/status-badge/status-badge.component.html`
- `frontend/src/app/shared/ui/status-badge/status-badge.component.css`
- `frontend/src/app/shared/ui/priority-badge/priority-badge.component.ts`
- `frontend/src/app/shared/ui/priority-badge/priority-badge.component.html`
- `frontend/src/app/shared/ui/priority-badge/priority-badge.component.css`
- `frontend/src/app/shared/ui/progress-meter/progress-meter.component.ts`
- `frontend/src/app/shared/ui/progress-meter/progress-meter.component.html`
- `frontend/src/app/shared/ui/progress-meter/progress-meter.component.css`
- `frontend/src/app/shared/ui/empty-state/empty-state.component.ts`
- `frontend/src/app/shared/ui/empty-state/empty-state.component.html`
- `frontend/src/app/shared/ui/empty-state/empty-state.component.css`
- `frontend/src/app/core/layout/app-shell.component.html`
- `frontend/src/app/core/layout/app-shell.component.css`
- `frontend/src/app/dashboard/dashboard-page.component.html`
- `frontend/src/app/dashboard/dashboard-page.component.css`
- `frontend/src/app/claims/feature-queue/claims-queue-page.component.html`
- `frontend/src/app/claims/feature-queue/claims-queue-page.component.css`
- `frontend/src/app/claims/feature-queue/claims-queue-page.component.spec.ts`
- `frontend/src/app/claims/feature-create/new-claim-page.component.html`
- `frontend/src/app/claims/feature-create/new-claim-page.component.css`
- `frontend/src/app/claims/feature-detail/claim-detail-page.component.html`
- `frontend/src/app/claims/feature-detail/claim-detail-page.component.css`
- `frontend/src/app/claims/feature-detail/claim-detail-page.component.spec.ts`

### Angular files to modify

- `frontend/src/styles.css`: global reset, tokens, typography, shared button/surface/form/focus/motion classes.
- `frontend/src/app/core/layout/app-shell.component.ts`: external template/style references only; retain router imports and OnPush.
- `frontend/src/app/dashboard/dashboard-page.component.ts`: external template/style references and reusable UI imports.
- `frontend/src/app/dashboard/dashboard-page.component.spec.ts`: verify the redesigned metric hierarchy and accessible workload output.
- `frontend/src/app/claims/feature-queue/claims-queue-page.component.ts`: external files, reusable UI imports, filter-chip removal, SLA presentation.
- `frontend/src/app/claims/feature-create/new-claim-page.component.ts`: external files, form-derived summary helpers, no validation changes.
- `frontend/src/app/claims/feature-create/new-claim-page.component.spec.ts`: test claim-type/evidence card behavior and error-summary preservation.
- `frontend/src/app/claims/feature-detail/claim-detail-page.component.ts`: external files, reusable UI imports, evidence helpers, no workflow changes.
- `README.md`: add the Figma source-of-truth link and frontend visual-system notes after implementation is verified.

---

### Task 1: Build Figma foundations and reusable components

**Files:**
- Modify: Figma file `jVmP142OtufkQZvNk8VE6y`
- Reference: `docs/superpowers/specs/2026-07-23-claimsops-command-center-design.md`

**Interfaces:**
- Consumes: approved palette, typography, spacing, radius, motion, and accessibility requirements.
- Produces: named variables and components used by every screen; component names must match the Angular mapping annotations in Task 2.

- [ ] **Step 1: Read the Figma runtime contracts before writing**

Load `figma-use`, its runtime contracts, and its design-system contracts. Use `Figma.get_metadata` to confirm the file is editable and inspect existing pages. Do not rerun a broad creation script blindly after a partial failure.

- [ ] **Step 2: Create or normalize the five required pages**

Use `Figma.use_figma` and create these exact page names in order when absent:

```text
01 Foundations
02 Components
03 Desktop Screens
04 Responsive Screens
05 Annotations
```

Return the page IDs and persist them in execution notes so later scripts target IDs rather than page-name guesses.

- [ ] **Step 3: Create Figma variables**

Create a collection named `ClaimsFlow` with a mode named `Light`. Add these exact color variables:

```text
color/nav/midnight        #071B2E
color/nav/elevated        #0D2942
color/surface/workspace   #F3F7FA
color/surface/primary     #FFFFFF
color/surface/secondary   #EAF1F5
color/text/primary        #102235
color/text/muted          #607286
color/border/default      #D5E0E8
color/accent/teal         #0A8478
color/accent/cyan         #27C7B8
color/semantic/info       #2F6FED
color/semantic/success    #15815D
color/semantic/warning    #B66A09
color/semantic/critical   #B93832
color/semantic/neutral    #64748B
```

Add number variables:

```text
space/1 4
space/2 8
space/3 12
space/4 16
space/5 24
space/6 32
space/7 40
space/8 48
radius/control 8
radius/card 12
radius/panel 16
```

- [ ] **Step 4: Build the foundations board**

On `01 Foundations`, create Auto Layout sections for color swatches, typography, spacing, radii, elevation, and accessibility. Use Inter with these exact styles:

```text
Display / 32 / Bold / 40 line height
Section / 20 / Bold / 28 line height
Card / 16 / Bold / 24 line height
Body / 14 / Regular / 22 line height
Label / 12 / Bold / 16 line height
Metric / 36 / Bold / 40 line height
Table / 13 / Regular / 20 line height
```

Include visible notes: `Never use color alone`, `Minimum 44px touch target on mobile`, `Visible focus ring`, and `No recommendation-provider claim without backend provenance`.

- [ ] **Step 5: Build component variants**

On `02 Components`, create local component sets with these exact names and properties:

```text
Button                 variant=Primary|Secondary|Danger|Ghost, state=Default|Hover|Focus|Disabled
Navigation item        state=Default|Hover|Active, icon=Overview|Claims|Add
Priority badge         priority=Low|Medium|High|Critical
Status badge           status=New|Under review|Waiting|Ready|Resolved|Closed
Progress meter         tone=Neutral|Success|Warning|Critical, size=Compact|Standard
Metric tile            emphasis=Primary|Neutral|Warning|Critical
Evidence selector      state=Unchecked|Checked|Missing, evidence=Report|Photos|Ownership|Medical
Alert                   tone=Info|Success|Warning|Critical
Timeline item           event=Created|Assignment|Status|Recommendation|Review
Command panel           tone=Neutral|Accent|Warning
Form control            kind=Input|Select|Textarea, state=Default|Focus|Invalid|Disabled
```

Every variant must use Auto Layout, variable-bound colors where supported, minimum accessible control sizes, and semantic text alongside color.

- [ ] **Step 6: Inspect the component page visually**

Use `Figma.get_screenshot` for the `02 Components` top-level frame. Verify:

- no text clipping;
- no detached labels;
- all variants have consistent padding;
- critical and warning colors remain readable;
- focus variants are visible against both light and midnight surfaces.

Fix issues with targeted node edits, then capture a second screenshot.

- [ ] **Step 7: Record the Figma checkpoint**

Add a short execution note to the branch commit or PR description containing the Foundations frame ID, Components frame ID, and screenshot node IDs. Figma edits are not represented by a Git commit, so this note is the review boundary.

---

### Task 2: Design the four desktop and four responsive Figma screens

**Files:**
- Modify: Figma file `jVmP142OtufkQZvNk8VE6y`
- Reference: current Angular templates and approved design specification.

**Interfaces:**
- Consumes: Task 1 variables and components.
- Produces: screen frames named exactly as listed below and implementation annotations used by Tasks 5–9.

- [ ] **Step 1: Create exact frame inventory**

Create these frames:

```text
Desktop / Dashboard / 1440
Desktop / Claims Queue / 1440
Desktop / New Claim / 1440
Desktop / Claim Workspace / 1440
Tablet / Shell / 768
Mobile / Dashboard / 390
Mobile / Claims Queue / 390
Mobile / New Claim / 390
Mobile / Claim Workspace / 390
```

Desktop frames use a 248px sidebar. Mobile frames use a compact top bar and visible primary destinations. Use Auto Layout for every screen root and principal region.

- [ ] **Step 2: Design dashboard using only supported data**

Use the existing five metrics, adjuster workload, and recent activity. Do not draw trends, recommendation counts, workflow-distribution charts, or ranked attention lists as implemented data. The five metric tiles must visually prioritize Open Claims, High Priority, and SLA Risk while keeping Unassigned and Incomplete quieter.

- [ ] **Step 3: Design claims queue**

Include search, status, priority, assignment, Apply, Reset, removable filter chips, semantic table columns, SLA countdown with timestamp context, completeness meter, and pagination. The mobile frame must render equivalent claim cards rather than a horizontally scrolling table.

- [ ] **Step 4: Design claim intake**

Use one visual form divided into Claimant, Incident, Evidence, and Review sections. Claim type and evidence use card-style controls, but retain visible labels and familiar control semantics. The sticky summary may show only completed required-field count, chosen claim type, and selected evidence count.

- [ ] **Step 5: Design claim workspace**

Include claim identity, priority, status, SLA, completeness, assignment, claim facts, description, evidence matrix, priority factors, decision support, sticky action rail, and uncollapsed audit timeline. Add this exact copy within the recommendation panel:

```text
Advisory recommendation. A human reviewer must approve or reject this suggestion before it affects the claim workflow.
```

Do not use `OpenAI recommendation` as the heading.

- [ ] **Step 6: Add implementation annotations**

On `05 Annotations`, map screen regions to exact source paths, list desktop/mobile breakpoints, describe hover/focus/loading/error/empty/disabled states, and flag any Figma-only future-capability idea as `Not implemented — unsupported by current API`.

- [ ] **Step 7: Perform Figma review**

Capture screenshots of all nine frames. Review at full size for hierarchy and at thumbnail size for scanability. Verify no unsupported data, no provenance claim, no color-only state, no clipped mobile control, and no horizontal overflow. Correct targeted nodes and capture final screenshots.

- [ ] **Step 8: Commit the design checkpoint document**

Create `docs/design/claimsops-command-center-figma.md` containing:

```markdown
# ClaimsOps Command Center Figma Source

- File: https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y
- Foundations frame: `<resolved node URL>`
- Components frame: `<resolved node URL>`
- Desktop screens section: `<resolved node URL>`
- Responsive screens section: `<resolved node URL>`
- Annotations section: `<resolved node URL>`

The Figma file is the visual source of truth. The approved behavioral scope remains defined by the Angular application and the redesign specification.
```

Replace each angle-bracket field with the real node URL before committing.

Run:

```bash
git add docs/design/claimsops-command-center-figma.md
git commit -m "docs: link ClaimsOps Figma designs"
```

---

### Task 3: Add global tokens and pure presentation utilities

**Files:**
- Modify: `frontend/src/styles.css`
- Create: `frontend/src/app/shared/presentation/label.util.ts`
- Create: `frontend/src/app/shared/presentation/sla-display.ts`
- Create: `frontend/src/app/shared/presentation/sla-display.spec.ts`

**Interfaces:**
- Produces: `humanizeLabel(value: string): string` and `getSlaDisplay(deadline: string, now?: Date): SlaDisplay`.
- `SlaDisplay` is `{ label: string; detail: string; tone: 'neutral' | 'warning' | 'critical' | 'expired'; hoursRemaining: number }`.

- [ ] **Step 1: Write failing SLA tests**

```typescript
import { getSlaDisplay } from './sla-display';

describe('getSlaDisplay', () => {
  const now = new Date('2026-07-23T12:00:00Z');

  it('marks deadlines within 24 hours as warning', () => {
    expect(getSlaDisplay('2026-07-23T17:00:00Z', now)).toEqual(jasmine.objectContaining({
      label: 'Due in 5h',
      tone: 'warning',
    }));
  });

  it('marks deadlines within two hours as critical', () => {
    expect(getSlaDisplay('2026-07-23T13:30:00Z', now)).toEqual(jasmine.objectContaining({
      label: 'Due in 1h 30m',
      tone: 'critical',
    }));
  });

  it('marks elapsed deadlines as expired', () => {
    expect(getSlaDisplay('2026-07-23T10:00:00Z', now)).toEqual(jasmine.objectContaining({
      label: 'Overdue by 2h',
      tone: 'expired',
    }));
  });

  it('uses days for non-urgent deadlines', () => {
    expect(getSlaDisplay('2026-07-26T12:00:00Z', now)).toEqual(jasmine.objectContaining({
      label: '3d remaining',
      tone: 'neutral',
    }));
  });
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/presentation/sla-display.spec.ts'
```

Expected: compilation failure because `sla-display.ts` does not exist.

- [ ] **Step 3: Implement the utilities**

```typescript
// label.util.ts
export function humanizeLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}
```

```typescript
// sla-display.ts
export type SlaTone = 'neutral' | 'warning' | 'critical' | 'expired';

export interface SlaDisplay {
  label: string;
  detail: string;
  tone: SlaTone;
  hoursRemaining: number;
}

export function getSlaDisplay(deadline: string, now = new Date()): SlaDisplay {
  const deadlineDate = new Date(deadline);
  const milliseconds = deadlineDate.getTime() - now.getTime();
  const hoursRemaining = milliseconds / 3_600_000;
  const absoluteMinutes = Math.round(Math.abs(milliseconds) / 60_000);
  const detail = deadlineDate.toLocaleString();

  if (milliseconds < 0) {
    return {
      label: `Overdue by ${formatDuration(absoluteMinutes)}`,
      detail,
      tone: 'expired',
      hoursRemaining,
    };
  }

  const label = absoluteMinutes < 48 * 60
    ? `Due in ${formatDuration(absoluteMinutes)}`
    : `${Math.round(absoluteMinutes / 1_440)}d remaining`;

  return {
    label,
    detail,
    tone: hoursRemaining <= 2 ? 'critical' : hoursRemaining <= 24 ? 'warning' : 'neutral',
    hoursRemaining,
  };
}

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}
```

- [ ] **Step 4: Replace global CSS with the approved token layer**

Define the approved variables under `:root`, then add reset, typography, `.button`, `.surface`, `.page-header`, `.eyebrow`, `.alert`, `.sr-only`, focus, and reduced-motion rules. The root variable block must include:

```css
:root {
  color-scheme: light;
  --color-nav-midnight: #071b2e;
  --color-nav-elevated: #0d2942;
  --color-workspace: #f3f7fa;
  --color-surface: #ffffff;
  --color-surface-secondary: #eaf1f5;
  --color-text: #102235;
  --color-text-muted: #607286;
  --color-border: #d5e0e8;
  --color-teal: #0a8478;
  --color-cyan: #27c7b8;
  --color-info: #2f6fed;
  --color-success: #15815d;
  --color-warning: #b66a09;
  --color-critical: #b93832;
  --color-neutral: #64748b;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 2.5rem;
  --space-8: 3rem;
  --radius-control: 0.5rem;
  --radius-card: 0.75rem;
  --radius-panel: 1rem;
  --shadow-raised: 0 16px 40px rgb(7 27 46 / 0.08);
  --focus-ring: 0 0 0 3px rgb(39 199 184 / 0.42);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--color-text);
  background: var(--color-workspace);
  line-height: 1.5;
}
```

- [ ] **Step 5: Run utility tests and production build**

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/presentation/sla-display.spec.ts'
npm run build
```

Expected: all focused tests pass and Angular production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/styles.css frontend/src/app/shared/presentation
git commit -m "feat: add ClaimsOps design tokens and formatters"
```

---

### Task 4: Add reusable badges, progress, and empty-state primitives

**Files:**
- Create the twelve files under `frontend/src/app/shared/ui/` listed in File Structure.
- Test: add focused specs beside each TypeScript component or one `frontend/src/app/shared/ui/shared-ui.spec.ts` that imports all four.

**Interfaces:**
- `StatusBadgeComponent` input: `status: ClaimStatus`.
- `PriorityBadgeComponent` input: `priority: ClaimPriority`.
- `ProgressMeterComponent` inputs: `value: number`, `label: string`, `tone: 'neutral' | 'success' | 'warning' | 'critical'`, `compact: boolean`.
- `EmptyStateComponent` inputs: `title: string`, `description: string`.

- [ ] **Step 1: Write failing component tests**

Test that:

```typescript
expect(statusElement.textContent).toContain('Under Review');
expect(statusElement.getAttribute('data-status')).toBe('UNDER_REVIEW');
expect(progress.getAttribute('aria-valuenow')).toBe('72');
expect(progress.getAttribute('aria-label')).toBe('Claim completeness');
```

- [ ] **Step 2: Run the new tests and confirm RED**

Expected: compilation failures because the shared UI components do not exist.

- [ ] **Step 3: Implement typed standalone components**

Use Angular `input.required<T>()` for required inputs, `ChangeDetectionStrategy.OnPush`, external HTML/CSS files, semantic text, and no service dependencies. `ProgressMeterComponent` must clamp visual width to `0..100` while preserving the supplied numeric value in accessible text.

Required decorator shape:

```typescript
@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly status = input.required<ClaimStatus>();
  readonly label = computed(() => humanizeLabel(this.status()));
}
```

Use the same pattern for the other components.

- [ ] **Step 4: Run shared UI tests and build**

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/ui/**/*.spec.ts'
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/shared/ui
git commit -m "feat: add ClaimsOps presentation components"
```

---

### Task 5: Refactor the application shell

**Files:**
- Modify: `frontend/src/app/core/layout/app-shell.component.ts`
- Create: `frontend/src/app/core/layout/app-shell.component.html`
- Create: `frontend/src/app/core/layout/app-shell.component.css`
- Modify: `frontend/src/app/app.component.spec.ts`

**Interfaces:**
- Consumes: global tokens and Angular Router directives.
- Produces: persistent desktop sidebar, compact responsive navigation, skip link, generic decision-support availability text, and demo-operator treatment.

- [ ] **Step 1: Extend the existing shell test**

Assert that the rendered shell includes:

```typescript
expect(root.querySelector('.skip-link')?.getAttribute('href')).toBe('#main-content');
expect(root.querySelector('[aria-label="Primary navigation"]')).not.toBeNull();
expect(root.textContent).toContain('Operations Intelligence');
expect(root.textContent).toContain('Decision support available');
expect(root.querySelector('#main-content')).not.toBeNull();
```

- [ ] **Step 2: Run the shell test and confirm RED**

The existing shell does not contain the new workspace and system-status copy.

- [ ] **Step 3: Move template and CSS into external files**

Change the component metadata to:

```typescript
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

The HTML must preserve the skip link and `main#main-content[tabindex="-1"]`. Use inline SVG icons with `aria-hidden="true"`, exact nav destinations, a generic green-dot system state, and `Interview User` as clearly labeled demo operator copy rather than authentication UI.

- [ ] **Step 4: Implement responsive CSS**

Desktop: 248px sticky midnight sidebar. At `max-width: 760px`, switch to a top bar and three-column visible primary nav. Ensure the mobile navigation does not rely on hover or a hamburger menu.

- [ ] **Step 5: Run shell test and build**

```bash
cd frontend
npm run test:ci -- --include='src/app/app.component.spec.ts'
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/core/layout frontend/src/app/app.component.spec.ts
git commit -m "feat: redesign ClaimsFlow application shell"
```

---

### Task 6: Refactor the operations dashboard

**Files:**
- Modify: `frontend/src/app/dashboard/dashboard-page.component.ts`
- Create: `frontend/src/app/dashboard/dashboard-page.component.html`
- Create: `frontend/src/app/dashboard/dashboard-page.component.css`
- Modify: `frontend/src/app/dashboard/dashboard-page.component.spec.ts`

**Interfaces:**
- Consumes: `DashboardService`, `ProgressMeterComponent`, `EmptyStateComponent`, existing `DashboardSnapshot`.
- Produces: visual hierarchy for five existing metrics, workload utilization, and recent activity only.

- [ ] **Step 1: Write failing dashboard expectations**

Extend the fixture data with one recent event and assert:

```typescript
expect(root.querySelectorAll('[data-testid="metric-tile"]').length).toBe(5);
expect(root.querySelector('[data-emphasis="critical"]')?.textContent).toContain('SLA risk');
expect(root.querySelector('progress[aria-label="Maya Chen workload"]')).not.toBeNull();
expect(root.textContent).toContain('Recent activity');
expect(root.textContent).not.toContain('Trend');
```

- [ ] **Step 2: Run dashboard spec and confirm RED**

- [ ] **Step 3: Externalize the template and CSS**

Retain the existing class behavior and signals. Add only presentation helpers such as:

```typescript
readonly todayLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date());

workloadPercent(active: number, capacity: number): number {
  return capacity <= 0 ? 0 : Math.min(100, Math.round((active / capacity) * 100));
}
```

- [ ] **Step 4: Implement dashboard layout**

Use one command header, a primary Open Claims tile, semantic High Priority and SLA Risk tiles, quiet Unassigned and Incomplete tiles, then two supported modules: Adjuster workload and Recent activity. Do not add charts or fabricated trend copy.

- [ ] **Step 5: Run dashboard test and build**

```bash
cd frontend
npm run test:ci -- --include='src/app/dashboard/dashboard-page.component.spec.ts'
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/dashboard
git commit -m "feat: redesign operations dashboard"
```

---

### Task 7: Refactor the claims queue with filter chips and SLA presentation

**Files:**
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.ts`
- Create: `frontend/src/app/claims/feature-queue/claims-queue-page.component.html`
- Create: `frontend/src/app/claims/feature-queue/claims-queue-page.component.css`
- Create: `frontend/src/app/claims/feature-queue/claims-queue-page.component.spec.ts`

**Interfaces:**
- Consumes: `ClaimFilters`, `serializeClaimFilters`, `humanizeLabel`, `getSlaDisplay`, badge/progress/empty components.
- Produces: `activeFilters(): ActiveFilterChip[]`, `removeFilter(key: FilterKey): void`, `sla(deadline: string): SlaDisplay`.

```typescript
type FilterKey = 'q' | 'status' | 'priority' | 'assignment';
interface ActiveFilterChip { key: FilterKey; label: string; }
```

- [ ] **Step 1: Write the queue component test harness**

Configure `ActivatedRoute` with a `BehaviorSubject<Params>`, mock `ClaimsApiService.list()` with one claim, and use `RouterTestingHarness` or a router spy. Add failing tests that:

```typescript
expect(component.activeFilters()).toEqual([
  { key: 'priority', label: 'Priority: High' },
  { key: 'assignment', label: 'Assignment: Unassigned' },
]);
component.removeFilter('priority');
expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
  queryParams: jasmine.objectContaining({ assignment: 'unassigned' }),
}));
expect(root.querySelector('table')).not.toBeNull();
expect(root.querySelector('[aria-label="72% complete"]')).not.toBeNull();
```

- [ ] **Step 2: Run queue spec and confirm RED**

- [ ] **Step 3: Add presentation methods without changing API filters**

Implement `activeFilters`, `removeFilter`, and `sla`. `removeFilter` must set only the requested field to its empty value, reset `page` to zero, serialize the remaining filters, and navigate relative to the current route.

- [ ] **Step 4: Implement semantic desktop table and mobile cards**

Keep a real `<table>` for desktop. Render a separate mobile card list hidden from desktop through CSS, using the same loaded claim data. Each card and table row must link to `/claims/:id`, show priority/status text, assignment, SLA label plus accessible timestamp, and a completeness meter.

- [ ] **Step 5: Implement responsive and sticky behavior**

At desktop widths, use sticky table headers and preserve horizontal containment inside the panel. At `max-width: 760px`, hide the table region and show cards. Do not hide fields required to understand urgency.

- [ ] **Step 6: Run queue tests and build**

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/feature-queue/claims-queue-page.component.spec.ts'
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/claims/feature-queue
git commit -m "feat: redesign claims work queue"
```

---

### Task 8: Refactor claim intake into a guided single-form experience

**Files:**
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.ts`
- Create: `frontend/src/app/claims/feature-create/new-claim-page.component.html`
- Create: `frontend/src/app/claims/feature-create/new-claim-page.component.css`
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.spec.ts`

**Interfaces:**
- Consumes: the existing reactive form and validators.
- Produces: `completedRequiredFields(): number`, `selectedEvidenceCount(): number`, `selectClaimType(type: ClaimType): void`.

- [ ] **Step 1: Add failing interaction tests**

Add tests that click a claim-type card and an evidence card, then assert the existing controls changed:

```typescript
fixture.nativeElement.querySelector('[data-claim-type="AUTO"]').click();
expect(component.form.controls.claimType.value).toBe('AUTO');

fixture.nativeElement.querySelector('[data-evidence="photosPresent"]').click();
expect(component.form.controls.photosPresent.value).toBeTrue();
```

Retain the existing future-date and incomplete-evidence tests. Add an invalid-submit test that confirms the summary uses `role="alert"` and receives focus.

- [ ] **Step 2: Run the intake spec and confirm RED**

- [ ] **Step 3: Externalize the component and add derived helpers**

Do not replace the form or validators. Implement claim-type selection through `form.controls.claimType.setValue(type)` and derive summary counts directly from current form controls. Do not predict backend priority or completeness.

- [ ] **Step 4: Build the guided form markup**

Use one `<form [formGroup]="form" (ngSubmit)="submit()">` with four numbered visual sections. Claim-type cards must wrap actual radio inputs or set the same form control through an accessible button/card pattern. Evidence cards must contain actual checkbox inputs bound to the existing boolean controls. Keep visible labels and the error summary.

- [ ] **Step 5: Implement the sticky summary and responsive layout**

Desktop uses form + sticky summary columns. At tablet/mobile widths, the summary becomes an inline final section. Keep submission actions reachable without covering focused controls.

- [ ] **Step 6: Run intake tests and build**

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/feature-create/new-claim-page.component.spec.ts'
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/claims/feature-create
git commit -m "feat: redesign guided claim intake"
```

---

### Task 9: Refactor the claim workspace and decision-support panel

**Files:**
- Modify: `frontend/src/app/claims/feature-detail/claim-detail-page.component.ts`
- Create: `frontend/src/app/claims/feature-detail/claim-detail-page.component.html`
- Create: `frontend/src/app/claims/feature-detail/claim-detail-page.component.css`
- Create: `frontend/src/app/claims/feature-detail/claim-detail-page.component.spec.ts`

**Interfaces:**
- Consumes: current `ClaimsApiService` methods, badge/progress/empty components, `getSlaDisplay`, existing recommendation and audit models.
- Produces: evidence-state helpers and redesigned markup; action method signatures remain unchanged.

- [ ] **Step 1: Create a workflow-preservation test harness**

Mock `get`, `getAdjusters`, and `getAudit` with `of(...)`. Mock `generateRecommendation` and `reviewRecommendation`. Assert:

```typescript
expect(root.textContent).toContain('Advisory recommendation');
expect(root.textContent).not.toContain('OpenAI recommendation');
expect(root.querySelector('[aria-label="75% complete"]')).not.toBeNull();

component.generate();
expect(api.generateRecommendation).toHaveBeenCalledWith('claim-1');

component.review('APPROVED');
expect(api.reviewRecommendation).toHaveBeenCalledWith(
  'claim-1', 'rec-1', 'APPROVED', 'Interview User'
);
```

Also test that approval/rejection controls are disabled while `acting()` is true and absent after a non-pending review state.

- [ ] **Step 2: Run detail spec and confirm RED**

- [ ] **Step 3: Externalize template/styles and import shared UI**

Keep all service calls and state transitions. Replace repeated label logic with `humanizeLabel`. Add pure helpers for evidence rows:

```typescript
readonly evidenceRows = computed(() => {
  const claim = this.claim();
  if (!claim) return [];
  return [
    { label: 'Incident report', present: claim.evidence.incidentReportPresent },
    { label: 'Damage photos', present: claim.evidence.photosPresent },
    { label: 'Proof of ownership', present: claim.evidence.proofOfOwnershipPresent },
    { label: 'Medical documentation', present: claim.evidence.medicalDocumentationPresent },
  ];
});
```

- [ ] **Step 4: Implement the command workspace**

Build:

- contextual claim header with number, claimant, badges, SLA, completeness, adjuster;
- main overview and incident-description surfaces;
- evidence matrix and priority factors;
- visually distinct decision-support panel with exact advisory copy;
- uncollapsed semantic audit timeline;
- sticky assignment/status action rail.

Do not expose provider provenance or add workflow actions that do not exist.

- [ ] **Step 5: Implement responsive action behavior**

At narrow widths, move the action rail inline after the claim header or to a sticky bottom region that does not obscure focus. Ensure select controls and buttons retain accessible labels and disabled explanations through nearby text.

- [ ] **Step 6: Run detail tests and build**

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/feature-detail/claim-detail-page.component.spec.ts'
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/claims/feature-detail
git commit -m "feat: redesign claim decision workspace"
```

---

### Task 10: Run accessibility, responsiveness, and motion review

**Files:**
- Modify as required: all frontend CSS/HTML files changed in Tasks 3–9.
- Test: existing and new component specs.

**Interfaces:**
- Consumes: complete redesigned frontend.
- Produces: consistent behavior at 320, 390, 768, 1024, and 1440px; keyboard-visible focus and reduced-motion compliance.

- [ ] **Step 1: Run all frontend tests before manual review**

```bash
cd frontend
npm run test:ci
```

Expected: zero failed specs.

- [ ] **Step 2: Start the application with seeded backend data**

From repository root:

```bash
docker compose up -d db
cd backend && mvn spring-boot:run
```

In another terminal:

```bash
cd frontend
npm start
```

Verify backend health before reviewing the UI.

- [ ] **Step 3: Review every route at required widths**

Review `/dashboard`, `/claims`, `/claims/new`, and one seeded `/claims/:id` at 320, 390, 768, 1024, and 1440px. Verify no horizontal page overflow, obscured focus, clipped labels, unusable tables/cards, or inaccessible sticky areas.

- [ ] **Step 4: Keyboard review**

Starting at the browser chrome, navigate each route using Tab, Shift+Tab, Enter, Space, and arrow keys where native controls support them. Verify skip link, route links, form fields, filter chips, table claim links, action controls, and recommendation review buttons.

- [ ] **Step 5: Reduced-motion and contrast review**

Enable reduced motion and confirm nonessential transitions stop. Check every text/background pair and focus ring against WCAG AA. Correct CSS variables or component styles rather than one-off overrides where possible.

- [ ] **Step 6: Run full tests and build after fixes**

```bash
cd frontend
npm run test:ci
npm run build
```

- [ ] **Step 7: Commit review fixes**

```bash
git add frontend
git commit -m "fix: polish responsive and accessible interactions"
```

Do not create an empty commit when no fixes are required.

---

### Task 11: Compare Angular implementation against Figma

**Files:**
- Modify as required: Figma file and frontend presentation files.
- Create: temporary screenshots outside the repository or PR-upload attachments only.

**Interfaces:**
- Consumes: approved Figma frames and locally rendered routes.
- Produces: documented visual parity without checking generated screenshots into source.

- [ ] **Step 1: Capture local route screenshots**

Capture desktop 1440px and mobile 390px screenshots for all four routes using browser tooling. Store them outside tracked repository paths.

- [ ] **Step 2: Export corresponding Figma screenshots**

Use `Figma.get_screenshot` for the eight matching screen frames at sufficient resolution for typography and spacing review.

- [ ] **Step 3: Review differences systematically**

Compare shell width, page padding, typography, surface hierarchy, badge colors, control dimensions, table density, sticky regions, and mobile stacking. Record only material discrepancies; do not chase subpixel differences caused by rendering engines.

- [ ] **Step 4: Correct implementation or Figma source intentionally**

Prefer correcting Angular when the approved Figma design is feasible and accessible. Update Figma when real content or browser constraints reveal a better solution. Keep both sources aligned and update annotations when behavior changes.

- [ ] **Step 5: Re-run focused tests and build for changed features**

Run relevant focused specs followed by:

```bash
cd frontend
npm run test:ci
npm run build
```

- [ ] **Step 6: Commit parity corrections**

```bash
git add frontend docs/design
git commit -m "fix: align frontend with ClaimsOps designs"
```

Do not create an empty commit when no tracked changes were needed.

---

### Task 12: Update documentation, verify CI, and open the pull request

**Files:**
- Modify: `README.md`
- Modify if needed: `docs/design/claimsops-command-center-figma.md`
- No committed screenshot binaries unless the repository already establishes that convention.

**Interfaces:**
- Consumes: final Figma and Angular output.
- Produces: reviewable PR with exact verification evidence and design links.

- [ ] **Step 1: Update README frontend section**

Add:

- the Figma source link;
- the ClaimsOps Command Center design principles;
- confirmation that UI state uses current APIs only;
- the existing frontend verification commands;
- the route-by-route interview demo path.

Do not describe unsupported capabilities.

- [ ] **Step 2: Run final local verification from a clean dependency install**

```bash
cd frontend
rm -rf node_modules
npm ci
npm run test:ci
npm run build
```

On Windows PowerShell, replace removal with:

```powershell
Remove-Item -Recurse -Force node_modules
```

Expected: clean install, zero failed tests, successful production build.

- [ ] **Step 3: Verify backend regression suite**

The redesign should not change backend code, but run the repository’s complete required verification:

```bash
cd backend
mvn verify
```

Expected: `BUILD SUCCESS`.

- [ ] **Step 4: Review the branch diff**

```bash
git status --short
git diff --check
git diff --stat main...HEAD
git log --oneline main..HEAD
```

Confirm no credentials, generated bundles, `node_modules`, temporary screenshots, tool transcripts, or unrelated files are tracked.

- [ ] **Step 5: Commit documentation**

```bash
git add README.md docs/design/claimsops-command-center-figma.md
git commit -m "docs: document ClaimsOps frontend design"
```

- [ ] **Step 6: Push and open a pull request**

Use a feature branch such as `feature/claimsops-command-center` created from the approved design branch. PR title:

```text
Redesign ClaimsFlow as a ClaimsOps command center
```

PR body must include:

- summary of the visual and maintainability improvements;
- Figma file and node links;
- routes redesigned;
- accessibility and responsive review performed;
- explicit statement that APIs and workflow semantics are unchanged;
- `npm ci`, `npm run test:ci`, `npm run build`, and `mvn verify` results;
- desktop and mobile before/after screenshots as PR attachments;
- known exclusions and recommendation-provenance safeguard.

- [ ] **Step 7: Verify GitHub Actions**

Inspect the workflow jobs for the exact PR head SHA. Require successful backend and frontend jobs. Fetch logs for any failed job, fix the underlying defect, rerun local verification, push, and re-check the new head SHA.

- [ ] **Step 8: Perform final two-stage review**

1. Specification review: verify every acceptance criterion in the design spec is satisfied.
2. Code-quality review: inspect maintainability, duplication, semantics, test strength, accessibility, and absence of unsupported claims.

Resolve all blocking findings before merge. Do not merge solely because the interface looks polished.

---

## Final Acceptance Checklist

- [ ] Figma contains approved foundations, components, four desktop screens, four mobile screens, tablet shell reference, and annotations.
- [ ] Figma uses Auto Layout and reusable component variants for principal UI elements.
- [ ] All four Angular routes match the approved design direction.
- [ ] Existing API contracts, routes, validation, service calls, and workflows remain unchanged.
- [ ] No unsupported data or recommendation-provider provenance is presented as real.
- [ ] Desktop queue remains a semantic table and mobile queue retains equivalent information.
- [ ] Claim intake remains one reactive form and preserves error-summary focus.
- [ ] Recommendation approval/rejection behavior and advisory warning remain intact.
- [ ] Interface works with keyboard navigation and at 320px width.
- [ ] Reduced-motion behavior is implemented.
- [ ] Existing and new frontend tests pass.
- [ ] Angular production build passes.
- [ ] Backend `mvn verify` passes.
- [ ] GitHub Actions is green for the final PR head.
- [ ] PR contains Figma links, screenshots, scope, exclusions, and verification evidence.
