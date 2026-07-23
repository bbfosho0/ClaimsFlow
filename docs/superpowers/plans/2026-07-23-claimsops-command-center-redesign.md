# ClaimsOps Command Center Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ClaimsFlow MVP presentation with a polished, responsive ClaimsOps Command Center in Figma and Angular without changing existing routes, APIs, validation, workflow semantics, or mandatory human review.

**Architecture:** Figma file `jVmP142OtufkQZvNk8VE6y` is the visual source of truth for design variables, reusable components, desktop screens, mobile screens, and implementation annotations. Angular 20 remains a standalone, lazy-routed application. CSS custom properties establish the same visual vocabulary in code; small typed presentation components remove repeated badge, progress, and empty-state markup; pure TypeScript utilities own derived labels such as SLA urgency; existing feature-page classes retain data loading and workflow behavior.

**Tech Stack:** Figma Design and Plugin API, Angular 20.3, TypeScript 5.8, Angular Reactive Forms, signals, RxJS 7.8, HTML, CSS custom properties, Jasmine, Karma, ChromeHeadless, GitHub Actions.

## Global Constraints

- Preserve `/dashboard`, `/claims`, `/claims/new`, and `/claims/:id` exactly.
- Preserve standalone components, route-level lazy loading, typed API services, signals, RxJS, and Reactive Forms.
- Do not add authentication, roles, real profiles, uploads, notifications, saved searches, unsupported filters, unsupported sorting, fabricated trends, charts, or analytics.
- Do not change backend code, API contracts, claim transition rules, assignment behavior, recommendation review semantics, or audit behavior.
- Do not label recommendations as OpenAI-generated because the current API does not expose provider provenance and deterministic fallback remains possible.
- Keep claim intake as one reactive form and one submit operation; four sections are visual grouping, not a routed wizard.
- Keep a semantic HTML table on desktop and equivalent structured claim cards on mobile.
- Use text or icons in addition to semantic color.
- Meet WCAG AA contrast, remain usable at 320px, preserve the skip link, programmatic labels, visible focus, loading/error/empty states, and intake error-summary focus.
- Use 120–280ms restrained motion and disable nonessential motion under `prefers-reduced-motion: reduce`.
- Do not add a UI framework, chart library, icon package, global state library, or new runtime dependency solely for presentation.
- Use inline SVG or CSS geometry for the small icon set.
- Use the exact approved palette and 8-point spacing system from the specification.
- Work on an isolated feature branch or worktree created from `design/claimsops-command-center`; never commit implementation code directly to `main`.
- Final verification is `npm ci`, `npm run test:ci`, `npm run build`, `mvn verify`, and green GitHub Actions for the exact PR head SHA.

---

## File Map

### Figma

- File: `https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y`
- `01 Foundations`: variables, typography, spacing, radii, elevation, accessibility notes.
- `02 Components`: navigation, buttons, badges, progress, metric tiles, controls, evidence selectors, alerts, timeline items, command panels.
- `03 Desktop Screens`: dashboard, queue, intake, claim workspace at 1440px.
- `04 Responsive Screens`: all four routes at 390px plus one 768px shell reference.
- `05 Annotations`: responsive rules, state matrix, supported-data limits, Angular path mapping.

### Create

- `docs/design/claimsops-command-center-figma.md`
- `frontend/src/app/shared/presentation/label.util.ts`
- `frontend/src/app/shared/presentation/sla-display.ts`
- `frontend/src/app/shared/presentation/sla-display.spec.ts`
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
- `frontend/src/app/shared/ui/shared-ui.spec.ts`
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

### Modify

- `frontend/src/styles.css`
- `frontend/src/app/core/layout/app-shell.component.ts`
- `frontend/src/app/app.component.spec.ts`
- `frontend/src/app/dashboard/dashboard-page.component.ts`
- `frontend/src/app/dashboard/dashboard-page.component.spec.ts`
- `frontend/src/app/claims/feature-queue/claims-queue-page.component.ts`
- `frontend/src/app/claims/feature-create/new-claim-page.component.ts`
- `frontend/src/app/claims/feature-create/new-claim-page.component.spec.ts`
- `frontend/src/app/claims/feature-detail/claim-detail-page.component.ts`
- `README.md`

---

### Task 1: Create Figma foundations and reusable components

**Files:**
- Modify: Figma file `jVmP142OtufkQZvNk8VE6y`
- Reference: `docs/superpowers/specs/2026-07-23-claimsops-command-center-design.md`

**Interfaces:**
- Produces exact page names, variables, component-set names, and node IDs consumed by Task 2.

- [ ] **Step 1: Load required Figma guidance**

Read `figma-use`, `runtime-contracts.md`, and `design-system-contracts.md`. Call `Figma.get_metadata` without a node ID to inspect current pages. Record every created or reused page ID; do not rerun a broad creation script after a partial failure.

- [ ] **Step 2: Create or reuse the exact pages**

Use `Figma.use_figma` to ensure these pages exist in this order:

```text
01 Foundations
02 Components
03 Desktop Screens
04 Responsive Screens
05 Annotations
```

Return an object shaped as:

```javascript
return {
  foundationsPageId,
  componentsPageId,
  desktopPageId,
  responsivePageId,
  annotationsPageId,
};
```

- [ ] **Step 3: Create the `ClaimsFlow` variable collection**

Create a `ClaimsFlow` collection with mode `Light`. Add exact color variables:

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

- [ ] **Step 4: Build `Foundations / Overview`**

On `01 Foundations`, build one Auto Layout frame named `Foundations / Overview` containing color swatches, typography, spacing, radii, elevation, and accessibility notes. Load Inter Regular, Semi Bold, and Bold before applying text styles. Use this exact type scale:

```text
Display / 32 / Bold / 40
Section / 20 / Bold / 28
Card / 16 / Bold / 24
Body / 14 / Regular / 22
Label / 12 / Bold / 16
Metric / 36 / Bold / 40
Table / 13 / Regular / 20
```

Include visible notes: `Never use color alone`, `Minimum 44px touch target on mobile`, `Visible focus ring`, and `No provider claim without backend provenance`.

- [ ] **Step 5: Build exact component sets**

On `02 Components`, create one top-level Auto Layout frame named `Components / Library` and these component sets:

```text
Button: variant=Primary|Secondary|Danger|Ghost, state=Default|Hover|Focus|Disabled
Navigation item: state=Default|Hover|Active, icon=Overview|Claims|Add
Priority badge: priority=Low|Medium|High|Critical
Status badge: status=New|Under review|Waiting|Ready|Resolved|Closed
Progress meter: tone=Neutral|Success|Warning|Critical, size=Compact|Standard
Metric tile: emphasis=Primary|Neutral|Warning|Critical
Evidence selector: state=Unchecked|Checked|Missing, evidence=Report|Photos|Ownership|Medical
Alert: tone=Info|Success|Warning|Critical
Timeline item: event=Created|Assignment|Status|Recommendation|Review
Command panel: tone=Neutral|Accent|Warning
Form control: kind=Input|Select|Textarea, state=Default|Focus|Invalid|Disabled
```

Use Auto Layout, variable-bound colors where supported, semantic text plus color, and minimum mobile control height of 44px.

- [ ] **Step 6: Review foundations and components**

Call `Figma.get_screenshot` for `Foundations / Overview` and `Components / Library`. Verify no clipping, consistent padding, readable warning/critical states, visible focus states, and no detached labels. Make targeted node edits and capture final screenshots.

- [ ] **Step 7: Record returned IDs**

Keep the returned page, top-level frame, and component-set IDs in execution notes for Task 2. This is the design review checkpoint; no Git commit is required for Figma-only changes.

---

### Task 2: Design desktop and responsive Figma screens

**Files:**
- Modify: Figma file `jVmP142OtufkQZvNk8VE6y`
- Create: `docs/design/claimsops-command-center-figma.md`

**Interfaces:**
- Consumes Task 1 variables/components.
- Produces exact screen-frame IDs and annotations consumed by Angular implementation and PR review.

- [ ] **Step 1: Create exact screen frames**

Create:

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

Desktop screens use a 248px sidebar. Mobile screens use a compact top bar with all three primary destinations visible. Every screen root and principal region uses Auto Layout.

- [ ] **Step 2: Build the dashboard**

Use only current data: Open Claims, High Priority, SLA Risk, Unassigned, Incomplete, Adjuster Workload, and Recent Activity. Do not show trends, recommendation totals, workflow distribution, or attention rankings. Prioritize Open Claims, High Priority, and SLA Risk visually.

- [ ] **Step 3: Build the queue**

Include search, status, priority, assignment, Apply, Reset, removable chips, semantic table columns, readable SLA pressure, completeness meter, and pagination. Mobile uses claim cards with equivalent fields rather than horizontal table scrolling.

- [ ] **Step 4: Build intake**

Use one visual form grouped into Claimant, Incident, Evidence, and Review. Claim type and evidence use card-style controls while retaining familiar labels and control semantics. Sticky summary shows only completed required fields, selected claim type, and selected evidence count.

- [ ] **Step 5: Build claim workspace**

Include claim identity, badges, SLA, completeness, assigned adjuster, facts, description, evidence matrix, priority factors, decision support, sticky action rail, and uncollapsed audit timeline. Use this exact advisory copy:

```text
Advisory recommendation. A human reviewer must approve or reject this suggestion before it affects the claim workflow.
```

Use `Decision support` as the heading; never `OpenAI recommendation`.

- [ ] **Step 6: Build annotations**

On `05 Annotations`, map principal regions to exact Angular file paths, document 760px and 1000px responsive transitions, enumerate hover/focus/loading/error/empty/disabled states, and label every unsupported future idea `Not implemented — unsupported by current API`.

- [ ] **Step 7: Inspect all nine frames**

Capture every frame with `Figma.get_screenshot`. Check hierarchy at full size and scanability at thumbnail size. Verify no unsupported data, provider claim, color-only state, clipped control, or horizontal mobile overflow. Correct only targeted nodes and recapture.

- [ ] **Step 8: Write the Figma source document with actual node URLs**

During execution, build each URL from the returned node ID:

```javascript
const nodeUrl = (nodeId) =>
  `https://www.figma.com/design/jVmP142OtufkQZvNk8VE6y?node-id=${nodeId.replace(':', '-')}`;
```

Write `docs/design/claimsops-command-center-figma.md` using those computed URLs. The document must list the Figma file, foundations frame, components frame, desktop section, responsive section, and annotations section, followed by:

```text
The Figma file is the visual source of truth. The approved behavioral scope remains defined by the Angular application and the redesign specification.
```

- [ ] **Step 9: Commit**

```bash
git add docs/design/claimsops-command-center-figma.md
git commit -m "docs: link ClaimsOps Figma designs"
```

---

### Task 3: Add design tokens and pure presentation utilities

**Files:**
- Modify: `frontend/src/styles.css`
- Create: `frontend/src/app/shared/presentation/label.util.ts`
- Create: `frontend/src/app/shared/presentation/sla-display.ts`
- Create: `frontend/src/app/shared/presentation/sla-display.spec.ts`

**Interfaces:**

```typescript
export function humanizeLabel(value: string): string;
export type SlaTone = 'neutral' | 'warning' | 'critical' | 'expired';
export interface SlaDisplay {
  label: string;
  detail: string;
  tone: SlaTone;
  hoursRemaining: number;
}
export function getSlaDisplay(deadline: string, now?: Date): SlaDisplay;
```

- [ ] **Step 1: Write failing SLA tests**

```typescript
import { getSlaDisplay } from './sla-display';

describe('getSlaDisplay', () => {
  const now = new Date('2026-07-23T12:00:00Z');

  it('formats a warning deadline', () => {
    expect(getSlaDisplay('2026-07-23T17:00:00Z', now)).toEqual(
      jasmine.objectContaining({ label: 'Due in 5h', tone: 'warning' }),
    );
  });

  it('formats a critical deadline', () => {
    expect(getSlaDisplay('2026-07-23T13:30:00Z', now)).toEqual(
      jasmine.objectContaining({ label: 'Due in 1h 30m', tone: 'critical' }),
    );
  });

  it('formats an elapsed deadline', () => {
    expect(getSlaDisplay('2026-07-23T10:00:00Z', now)).toEqual(
      jasmine.objectContaining({ label: 'Overdue by 2h', tone: 'expired' }),
    );
  });

  it('formats a non-urgent deadline in days', () => {
    expect(getSlaDisplay('2026-07-26T12:00:00Z', now)).toEqual(
      jasmine.objectContaining({ label: '3d remaining', tone: 'neutral' }),
    );
  });
});
```

- [ ] **Step 2: Run RED**

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/presentation/sla-display.spec.ts'
```

Expected: TypeScript cannot resolve `./sla-display`.

- [ ] **Step 3: Implement utilities**

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

  return {
    label: absoluteMinutes < 2_880
      ? `Due in ${formatDuration(absoluteMinutes)}`
      : `${Math.round(absoluteMinutes / 1_440)}d remaining`,
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

- [ ] **Step 4: Replace global CSS with tokens and shared rules**

Start `styles.css` with this exact block:

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

Then add reset, typography, `.button`, `.surface`, `.page-header`, `.eyebrow`, `.alert`, `.sr-only`, visible `:focus-visible`, page-entry animation, and a `prefers-reduced-motion` block that removes transitions and animations.

- [ ] **Step 5: Run GREEN and build**

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/presentation/sla-display.spec.ts'
npm run build
```

Expected: four SLA specs pass and production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/styles.css frontend/src/app/shared/presentation
git commit -m "feat: add ClaimsOps tokens and presentation utilities"
```

---

### Task 4: Add typed shared UI primitives

**Files:**
- Create: all `frontend/src/app/shared/ui/**` files listed in File Map.
- Test: `frontend/src/app/shared/ui/shared-ui.spec.ts`

**Interfaces:**

```typescript
StatusBadgeComponent.status: InputSignal<ClaimStatus>
PriorityBadgeComponent.priority: InputSignal<ClaimPriority>
ProgressMeterComponent.value: InputSignal<number>
ProgressMeterComponent.label: InputSignal<string>
ProgressMeterComponent.tone: InputSignal<'neutral' | 'success' | 'warning' | 'critical'>
ProgressMeterComponent.compact: InputSignal<boolean>
EmptyStateComponent.title: InputSignal<string>
EmptyStateComponent.description: InputSignal<string>
```

- [ ] **Step 1: Write failing shared UI tests**

Use host test components to bind signal inputs. Assert:

```typescript
expect(root.querySelector('app-status-badge')?.textContent).toContain('Under Review');
expect(root.querySelector('[data-status="UNDER_REVIEW"]')).not.toBeNull();
expect(root.querySelector('[data-priority="CRITICAL"]')?.textContent).toContain('Critical');
expect(root.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('72');
expect(root.querySelector('[role="progressbar"]')?.getAttribute('aria-label')).toBe('Claim completeness');
expect(root.textContent).toContain('No claims found');
```

- [ ] **Step 2: Run RED**

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/ui/shared-ui.spec.ts'
```

Expected: imports fail because the four components do not exist.

- [ ] **Step 3: Implement `StatusBadgeComponent`**

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ClaimStatus } from '../../models/claim.models';
import { humanizeLabel } from '../../presentation/label.util';

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

Template:

```html
<span class="badge" [attr.data-status]="status()">
  <span class="badge__dot" aria-hidden="true"></span>
  {{ label() }}
</span>
```

- [ ] **Step 4: Implement `PriorityBadgeComponent`**

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ClaimPriority } from '../../models/claim.models';
import { humanizeLabel } from '../../presentation/label.util';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  templateUrl: './priority-badge.component.html',
  styleUrl: './priority-badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityBadgeComponent {
  readonly priority = input.required<ClaimPriority>();
  readonly label = computed(() => humanizeLabel(this.priority()));
}
```

Template:

```html
<span class="badge" [attr.data-priority]="priority()">
  <span class="badge__icon" aria-hidden="true">◆</span>
  {{ label() }}
</span>
```

- [ ] **Step 5: Implement `ProgressMeterComponent`**

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type ProgressTone = 'neutral' | 'success' | 'warning' | 'critical';

@Component({
  selector: 'app-progress-meter',
  standalone: true,
  templateUrl: './progress-meter.component.html',
  styleUrl: './progress-meter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressMeterComponent {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly tone = input<ProgressTone>('neutral');
  readonly compact = input(false);
  readonly clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));
}
```

Template:

```html
<div class="meter" [class.meter--compact]="compact()" [attr.data-tone]="tone()">
  <div
    class="meter__track"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    [attr.aria-valuenow]="clampedValue()"
    [attr.aria-label]="label()"
  >
    <span class="meter__fill" [style.width.%]="clampedValue()"></span>
  </div>
  <span class="meter__value">{{ clampedValue() }}%</span>
</div>
```

- [ ] **Step 6: Implement `EmptyStateComponent`**

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
```

Template:

```html
<div class="empty-state">
  <span class="empty-state__mark" aria-hidden="true"></span>
  <strong>{{ title() }}</strong>
  <p>{{ description() }}</p>
  <ng-content />
</div>
```

- [ ] **Step 7: Style exact semantic states**

Use component-scoped CSS and global variables. Every badge includes visible text. Critical/high priority use red/amber treatments; resolved/closed use success/neutral treatments; progress tone changes the fill but keeps numeric text.

- [ ] **Step 8: Run GREEN and build**

```bash
cd frontend
npm run test:ci -- --include='src/app/shared/ui/shared-ui.spec.ts'
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/shared/ui
git commit -m "feat: add ClaimsOps shared UI primitives"
```

---

### Task 5: Refactor shell and dashboard

**Files:**
- Modify: `frontend/src/app/core/layout/app-shell.component.ts`
- Create: `frontend/src/app/core/layout/app-shell.component.html`
- Create: `frontend/src/app/core/layout/app-shell.component.css`
- Modify: `frontend/src/app/app.component.spec.ts`
- Modify: `frontend/src/app/dashboard/dashboard-page.component.ts`
- Create: `frontend/src/app/dashboard/dashboard-page.component.html`
- Create: `frontend/src/app/dashboard/dashboard-page.component.css`
- Modify: `frontend/src/app/dashboard/dashboard-page.component.spec.ts`

**Interfaces:**
- Shell preserves `RouterOutlet`, `RouterLink`, `RouterLinkActive`, skip link, and `main#main-content`.
- Dashboard consumes existing `DashboardService` data only.

- [ ] **Step 1: Add failing shell assertions**

```typescript
expect(root.querySelector('.skip-link')?.getAttribute('href')).toBe('#main-content');
expect(root.querySelector('[aria-label="Primary navigation"]')).not.toBeNull();
expect(root.textContent).toContain('Operations Intelligence');
expect(root.textContent).toContain('Decision support available');
expect(root.querySelector('#main-content')).not.toBeNull();
```

- [ ] **Step 2: Add failing dashboard assertions**

Extend the dashboard fixture with one recent event, then assert five `[data-testid="metric-tile"]` elements, critical emphasis on SLA Risk, a workload progress element labeled `Maya Chen workload`, and no `Trend` copy.

- [ ] **Step 3: Run RED**

```bash
cd frontend
npm run test:ci -- --include='src/app/app.component.spec.ts' --include='src/app/dashboard/dashboard-page.component.spec.ts'
```

- [ ] **Step 4: Externalize shell template and CSS**

Use:

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

Preserve skip link and `main#main-content[tabindex="-1"]`. Add inline SVG icons with `aria-hidden="true"`, exact routes, generic `Decision support available`, and clearly labeled demo operator `Interview User`. Desktop uses a 248px sticky midnight sidebar. At 760px, use a top bar and visible three-destination navigation without a hamburger-only interaction.

- [ ] **Step 5: Externalize dashboard template and CSS**

Keep service loading logic unchanged. Add:

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

Build one command header, five current metrics, Adjuster Workload, and Recent Activity. Do not add charts, trend percentages, or fabricated modules.

- [ ] **Step 6: Run GREEN and build**

```bash
cd frontend
npm run test:ci -- --include='src/app/app.component.spec.ts' --include='src/app/dashboard/dashboard-page.component.spec.ts'
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/core/layout frontend/src/app/app.component.spec.ts frontend/src/app/dashboard
git commit -m "feat: redesign ClaimsOps shell and dashboard"
```

---

### Task 6: Refactor claims queue

**Files:**
- Modify: `frontend/src/app/claims/feature-queue/claims-queue-page.component.ts`
- Create: `frontend/src/app/claims/feature-queue/claims-queue-page.component.html`
- Create: `frontend/src/app/claims/feature-queue/claims-queue-page.component.css`
- Create: `frontend/src/app/claims/feature-queue/claims-queue-page.component.spec.ts`

**Interfaces:**

```typescript
type FilterKey = 'q' | 'status' | 'priority' | 'assignment';
interface ActiveFilterChip { key: FilterKey; label: string; }
activeFilters(): ActiveFilterChip[];
removeFilter(key: FilterKey): void;
sla(deadline: string): SlaDisplay;
```

- [ ] **Step 1: Write failing component tests**

Use a `BehaviorSubject<Params>` for `ActivatedRoute.queryParams`, mock `ClaimsApiService.list()` with one claim, and spy on `Router.navigate`. Assert:

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
expect(root.querySelector('[aria-label="Claim completeness"]')).not.toBeNull();
```

- [ ] **Step 2: Run RED**

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/feature-queue/claims-queue-page.component.spec.ts'
```

- [ ] **Step 3: Externalize and add presentation methods**

Import `humanizeLabel`, `getSlaDisplay`, `SlaDisplay`, and shared UI components. Replace the local label implementation with `humanizeLabel`. `removeFilter` must clear one requested field, set page to zero, serialize remaining filters, and navigate relative to the current route. Do not add new backend filter values.

- [ ] **Step 4: Build desktop table and mobile cards**

Desktop retains a real `<table>` with sticky headers. Mobile renders a separate structured card list from the same `page.content`. Both views show claim link, claimant, type, priority, status, assignment, SLA label with timestamp context, and completeness meter.

- [ ] **Step 5: Run GREEN and build**

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/feature-queue/claims-queue-page.component.spec.ts'
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/claims/feature-queue
git commit -m "feat: redesign claims work queue"
```

---

### Task 7: Refactor guided claim intake

**Files:**
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.ts`
- Create: `frontend/src/app/claims/feature-create/new-claim-page.component.html`
- Create: `frontend/src/app/claims/feature-create/new-claim-page.component.css`
- Modify: `frontend/src/app/claims/feature-create/new-claim-page.component.spec.ts`

**Interfaces:**

```typescript
completedRequiredFields(): number;
selectedEvidenceCount(): number;
selectClaimType(type: ClaimType): void;
```

- [ ] **Step 1: Add failing interaction tests**

Retain future-date and incomplete-evidence tests. Add:

```typescript
fixture.detectChanges();
fixture.nativeElement.querySelector('[data-claim-type="AUTO"]').click();
expect(component.form.controls.claimType.value).toBe('AUTO');

fixture.nativeElement.querySelector('[data-evidence="photosPresent"]').click();
expect(component.form.controls.photosPresent.value).toBeTrue();
```

Add invalid-submit coverage proving the error summary has `role="alert"` and receives focus after the scheduled focus callback.

- [ ] **Step 2: Run RED**

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/feature-create/new-claim-page.component.spec.ts'
```

- [ ] **Step 3: Externalize without changing form behavior**

Keep all existing controls, validators, `submit()`, API call, navigation, and error collection. `selectClaimType` calls `form.controls.claimType.setValue(type)`. Summary helpers derive only required-field completion and selected evidence count; they must not predict backend completeness or priority.

- [ ] **Step 4: Build one guided form**

Use one `<form [formGroup]="form" (ngSubmit)="submit()">` with Claimant, Incident, Evidence, and Review sections. Claim-type cards remain backed by `claimType`; evidence cards contain actual checkbox inputs bound to existing boolean controls. Preserve visible labels, error summary, description count, server error, disabled submission, and Cancel route.

- [ ] **Step 5: Implement responsive summary**

Desktop uses a sticky summary column. Below 850px, move the summary inline after Evidence. Sticky content must not cover focused controls.

- [ ] **Step 6: Run GREEN and build**

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

### Task 8: Refactor claim decision workspace

**Files:**
- Modify: `frontend/src/app/claims/feature-detail/claim-detail-page.component.ts`
- Create: `frontend/src/app/claims/feature-detail/claim-detail-page.component.html`
- Create: `frontend/src/app/claims/feature-detail/claim-detail-page.component.css`
- Create: `frontend/src/app/claims/feature-detail/claim-detail-page.component.spec.ts`

**Interfaces:**
- Keep `assign()`, `updateStatus()`, `generate()`, and `review()` signatures and service calls unchanged.
- Add `evidenceRows` computed signal and use shared label/SLA/UI presentation.

- [ ] **Step 1: Write failing workflow-preservation tests**

Mock `get`, `getAdjusters`, `getAudit`, `generateRecommendation`, and `reviewRecommendation`. Assert:

```typescript
expect(root.textContent).toContain('Advisory recommendation');
expect(root.textContent).not.toContain('OpenAI recommendation');
expect(root.querySelector('[aria-label="Claim completeness"]')).not.toBeNull();
component.generate();
expect(api.generateRecommendation).toHaveBeenCalledWith('claim-1');
component.review('APPROVED');
expect(api.reviewRecommendation).toHaveBeenCalledWith(
  'claim-1', 'rec-1', 'APPROVED', 'Interview User',
);
```

Also assert review buttons are disabled while `acting()` is true and absent after review state becomes approved or rejected.

- [ ] **Step 2: Run RED**

```bash
cd frontend
npm run test:ci -- --include='src/app/claims/feature-detail/claim-detail-page.component.spec.ts'
```

- [ ] **Step 3: Externalize and add evidence presentation**

Keep all service calls and state transitions. Add:

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

Use `humanizeLabel` and `getSlaDisplay` for presentation only.

- [ ] **Step 4: Build the workspace**

Implement contextual header, facts, incident description, evidence matrix, priority factors, distinct decision-support panel, uncollapsed audit timeline, and sticky assignment/status rail. The decision panel includes the exact advisory copy from Task 2, confidence as numeric text plus progress, missing information, review state, reviewer, and current approve/reject actions. Do not expose provider provenance.

- [ ] **Step 5: Implement responsive actions**

Below 850px, move the rail inline after the header. Ensure selects and buttons retain visible labels and sticky content never obscures focus.

- [ ] **Step 6: Run GREEN and build**

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

### Task 9: Accessibility, responsiveness, and Figma parity review

**Files:**
- Modify only files from Tasks 3–8 when defects are found.
- Store screenshots outside tracked repository paths or attach them directly to the PR.

**Interfaces:**
- Produces verified behavior at 320, 390, 768, 1024, and 1440px and visual parity with the approved Figma frames.

- [ ] **Step 1: Run the complete frontend suite**

```bash
cd frontend
npm run test:ci
npm run build
```

Expected: zero failed specs and successful production build.

- [ ] **Step 2: Start seeded application**

Terminal 1:

```bash
docker compose up -d db
cd backend
mvn spring-boot:run
```

Terminal 2:

```bash
cd frontend
npm start
```

Confirm `http://localhost:8080/actuator/health` reports `UP` before UI review.

- [ ] **Step 3: Review all routes and widths**

Review `/dashboard`, `/claims`, `/claims/new`, and one seeded `/claims/:id` at 320, 390, 768, 1024, and 1440px. Check page overflow, clipping, table/card equivalence, sticky regions, focus visibility, labels, disabled states, and touch targets.

- [ ] **Step 4: Keyboard and reduced-motion review**

Navigate with Tab, Shift+Tab, Enter, Space, and native control arrows. Verify skip link, navigation, filter chips, claim links, form controls, action controls, and recommendation review. Enable reduced motion and confirm nonessential animation is removed.

- [ ] **Step 5: Compare implementation and Figma**

Capture 1440px and 390px browser screenshots for all routes outside the repo. Export the eight matching Figma frames. Compare sidebar width, page padding, hierarchy, typography, badge colors, controls, table density, and mobile stacking. Correct material discrepancies; do not chase subpixel renderer differences.

- [ ] **Step 6: Re-run complete verification after fixes**

```bash
cd frontend
npm run test:ci
npm run build
```

- [ ] **Step 7: Commit only when fixes exist**

```bash
git add frontend docs/design
git commit -m "fix: polish responsive and accessible interactions"
```

Do not create an empty commit.

---

### Task 10: Documentation, full verification, PR, and CI

**Files:**
- Modify: `README.md`
- Modify if node links changed: `docs/design/claimsops-command-center-figma.md`

**Interfaces:**
- Produces a reviewable pull request with design links, screenshots, verification evidence, and no generated artifacts.

- [ ] **Step 1: Update README**

Add the Figma source link, ClaimsOps visual principles, statement that UI uses current APIs only, frontend verification commands, and route-by-route demo path. Do not describe unsupported capabilities.

- [ ] **Step 2: Verify from a clean frontend install**

Unix-like shell:

```bash
cd frontend
rm -rf node_modules
npm ci
npm run test:ci
npm run build
```

Windows PowerShell:

```powershell
Set-Location frontend
Remove-Item -Recurse -Force node_modules
npm ci
npm run test:ci
npm run build
```

Expected: clean install, zero failed tests, successful production build.

- [ ] **Step 3: Run backend regression suite**

```bash
cd backend
mvn verify
```

Expected: `BUILD SUCCESS`.

- [ ] **Step 4: Review branch hygiene**

```bash
git status --short
git diff --check
git diff --stat main...HEAD
git log --oneline main..HEAD
```

Confirm no credentials, `node_modules`, `dist`, `target`, temporary screenshots, prompt logs, tool transcripts, or unrelated files are tracked.

- [ ] **Step 5: Commit documentation**

```bash
git add README.md docs/design/claimsops-command-center-figma.md
git commit -m "docs: document ClaimsOps frontend design"
```

- [ ] **Step 6: Push and open PR**

Use branch `feature/claimsops-command-center` created from the approved design branch. PR title:

```text
Redesign ClaimsFlow as a ClaimsOps command center
```

PR body includes summary, Figma links, redesigned routes, accessibility and responsive review, unchanged API/workflow statement, exact local verification results, desktop/mobile before-and-after screenshots as attachments, exclusions, and the recommendation-provenance safeguard.

- [ ] **Step 7: Verify GitHub Actions for the exact PR head**

Require successful backend and frontend jobs. On failure, fetch failed job steps/logs, fix the underlying defect, rerun local verification, push, and inspect the new head SHA.

- [ ] **Step 8: Perform two-stage final review**

1. Specification review: map every acceptance criterion to implementation evidence.
2. Code-quality review: inspect maintainability, duplication, semantic HTML, accessibility, test strength, and unsupported claims.

Resolve all blocking findings before merge. Do not merge solely because the UI looks polished.

---

## Final Acceptance Checklist

- [ ] Figma contains foundations, components, four desktop screens, four mobile screens, tablet shell, and annotations.
- [ ] Principal Figma structures use Auto Layout and reusable variants.
- [ ] All four Angular routes match the approved ClaimsOps direction.
- [ ] Existing routes, APIs, validation, service calls, and workflows remain unchanged.
- [ ] No unsupported data or provider provenance is presented as real.
- [ ] Desktop queue remains a semantic table and mobile queue contains equivalent information.
- [ ] Intake remains one reactive form and preserves error-summary focus.
- [ ] Recommendation advisory copy and approval/rejection behavior remain intact.
- [ ] Interface works with keyboard navigation and at 320px.
- [ ] Reduced-motion behavior is implemented.
- [ ] Existing and new frontend tests pass.
- [ ] Angular production build passes.
- [ ] Backend `mvn verify` passes.
- [ ] GitHub Actions is green for the final PR head.
- [ ] PR contains Figma links, screenshots, scope, exclusions, and verification evidence.
