# ClaimsFlow Figma Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a portfolio-grade Figma prototype that connects the cinematic ClaimsFlow showcase, six-step guided tour, core claims workflow, decision confirmations, intake states, and technical proof without modifying production application code.

**Architecture:** Preserve every canonical `FINAL / 01–04` reference frame and create a separate prototype sequence on `FINAL / 08 Prototype Reference`. Use cloned canonical screens inside consistent 1440 × 1024 viewport frames, a shared floating tour controller, Smart Animate navigation, dedicated confirmation overlays, and explicit success states. The prototype validates hierarchy, storytelling, navigation, and motion intent; backend behavior remains represented rather than reimplemented.

**Tech Stack:** Figma Design, Figma Plugin API through `use_figma`, Figma prototype reactions, Smart Animate, optional Figma Motion keyframes when the account feature is available, GitHub documentation.

## Global Constraints

- Work only in Figma file `M7GOuna2hq7jWCGTZhiP5b` and repository `bbfosho0/ClaimsFlow`.
- Work on page `86:2`, named `FINAL / 08 Prototype Reference`.
- Preserve canonical source frames `211:56`, `211:329`, `211:658`, and `211:962` unchanged.
- Preserve hidden legacy frames `86:3`, `86:134`, `86:356`, and `86:521`; do not delete them.
- Do not modify production Angular, Spring Boot, PostgreSQL, API, or test code.
- Use a consistent 1440 × 1024 presentation viewport for every primary prototype destination.
- Keep full-height workspace and intake clones nested inside clipped viewport frames rather than destructively resizing their source layouts.
- Use the approved semantic colors: teal for healthy flow and primary action, cyan for live system activity, violet for assistive intelligence, amber for incomplete or approaching-SLA states, red for immediate risk, and blue-gray for structure.
- Motion must explain hierarchy, causality, state, or navigation. Do not add scroll hijacking, constant floating, input-blocking sequences, or decorative loops inside application screens.
- Every cinematic transition must have an immediate resting-state equivalent and a visible textual explanation.
- Prototype controls must remain keyboard-legible and visually distinguishable even though Figma cannot fully simulate production keyboard behavior.
- Load every affected text node font before changing characters, font size, font weight, or text layout.
- Use `await figma.setCurrentPageAsync(page)` to switch pages. Never assign `figma.currentPage` and never call `loadAllPagesAsync()`.
- Use exact node IDs returned by each mutation call for retries. Never rerun a broad creation script after a partial failure.
- If Figma Motion APIs report that the user feature is unsupported, stop using Motion APIs and keep the Smart Animate implementation.
- Resting screenshots verify layout only. Use `get_motion_context` and `export_video` only when actual timeline keyframes are authored.

---

## Prototype Frame Map

Create one new section named `PROTOTYPE / Portfolio Experience` below the existing reference canvas. Arrange primary frames in reading order with 160 px gaps.

| Prototype ID | Frame name | Purpose |
|---|---|---|
| P00 | `P00 / Showcase / Initial` | Near-black initialization state |
| P01 | `P01 / Showcase / Ready` | Fully resolved portfolio hero |
| P02 | `P02 / Tour / Portfolio Pressure` | Tour step 1 on Operations Overview |
| P03 | `P03 / Tour / Prioritized Queue` | Tour step 2 on Claims Queue |
| P04 | `P04 / Tour / Claim Investigation` | Tour step 3 on workspace overview |
| P05 | `P05 / Tour / Evidence Review` | Evidence-focused workspace state |
| P06 | `P06 / Tour / Human Decision` | Tour step 4 decision-support state |
| P07 | `P07 / Overlay / Approve Decision` | Approve reason confirmation |
| P08 | `P08 / Overlay / Reject Decision` | Reject reason confirmation |
| P09 | `P09 / State / Decision Confirmed` | Updated recommendation and audit event |
| P10 | `P10 / Tour / New Claim Intake` | Tour step 5 intake state |
| P11 | `P11 / State / Upload Resolved` | Evidence retry success state |
| P12 | `P12 / State / Claim Created` | Created claim and backend-triage result |
| P13 | `P13 / Tour / Technical Proof` | Tour step 6 architecture and verification |
| P14 | `P14 / Mobile / Showcase` | Key 390 px showcase state |
| P15 | `P15 / Mobile / Tour Controller` | Key mobile controller and decision state |
| P16 | `P16 / Notes / Reduced Motion` | Static reduced-motion and handoff contract |

---

### Task 1: Prepare the isolated prototype workspace

**Files:**
- Modify: Figma page `86:2`, `FINAL / 08 Prototype Reference`
- Preserve: Figma nodes `211:56`, `211:329`, `211:658`, `211:962`
- Document: `docs/superpowers/plans/2026-07-30-claimsflow-figma-prototype.md`

**Interfaces:**
- Consumes: canonical final frames and the approved design specification.
- Produces: section node ID, frame registry object, and exact placement coordinates for every later task.

- [ ] **Step 1: Inspect the target page and canonical nodes**

Run `get_design_context` for page `86:2` and confirm the four canonical nodes exist and are visible.

Expected: `211:56`, `211:329`, `211:658`, and `211:962` resolve without mutation.

- [ ] **Step 2: Create a dedicated prototype section**

Use `use_figma` to create a section named `PROTOTYPE / Portfolio Experience` at `x = 0`, `y = 1900`, with enough bounds for a four-column frame grid and overlay library.

```js
const page = await figma.getNodeByIdAsync('86:2');
if (!page || page.type !== 'PAGE') throw new Error('Prototype page not found');
await figma.setCurrentPageAsync(page);

const section = figma.createSection();
section.name = 'PROTOTYPE / Portfolio Experience';
section.x = 0;
section.y = 1900;
section.resizeWithoutConstraints(6240, 5200);
return { sectionId: section.id };
```

Expected: one empty section appears below the existing reference canvas.

- [ ] **Step 3: Create the frame registry helper**

Use a registry object for all subsequent reaction wiring.

```js
const prototypeFrames = {
  showcaseInitial: 'P00 / Showcase / Initial',
  showcaseReady: 'P01 / Showcase / Ready',
  portfolioPressure: 'P02 / Tour / Portfolio Pressure',
  prioritizedQueue: 'P03 / Tour / Prioritized Queue',
  claimInvestigation: 'P04 / Tour / Claim Investigation',
  evidenceReview: 'P05 / Tour / Evidence Review',
  humanDecision: 'P06 / Tour / Human Decision',
  approveOverlay: 'P07 / Overlay / Approve Decision',
  rejectOverlay: 'P08 / Overlay / Reject Decision',
  decisionConfirmed: 'P09 / State / Decision Confirmed',
  newClaim: 'P10 / Tour / New Claim Intake',
  uploadResolved: 'P11 / State / Upload Resolved',
  claimCreated: 'P12 / State / Claim Created',
  technicalProof: 'P13 / Tour / Technical Proof',
  mobileShowcase: 'P14 / Mobile / Showcase',
  mobileController: 'P15 / Mobile / Tour Controller',
  reducedMotion: 'P16 / Notes / Reduced Motion'
};
```

Expected: every later task uses these exact names.

- [ ] **Step 4: Verify source-frame immutability**

Read the source frame names, child counts, positions, and sizes before cloning and store them in the returned result.

Expected: later QA can confirm that the source values did not change.

---

### Task 2: Build the cinematic showcase states

**Files:**
- Create: Figma frames `P00 / Showcase / Initial`, `P01 / Showcase / Ready`
- Clone from: `211:127`, `211:202`, and selected atmosphere elements from `211:56`

**Interfaces:**
- Consumes: Operations Overview visual language and semantic colors.
- Produces: showcase entry point, tour entry hotspot, live-application hotspot, source hotspot, and architecture hotspot.

- [ ] **Step 1: Build the resolved showcase frame first**

Create `P01 / Showcase / Ready` at 1440 × 1024 with:

- Near-black canvas wash and bounded grid.
- `ClaimsFlow` wordmark and `PORTFOLIO SYSTEM / 2026` eyebrow.
- Hero thesis: `An audit-ready insurance claims operations system.`
- Supporting copy explaining Angular, Spring Boot, PostgreSQL, deterministic decision support, and immutable audit history.
- Four technology badges: `ANGULAR 20`, `SPRING BOOT`, `POSTGRESQL`, `HUMAN-CONTROLLED INTELLIGENCE`.
- Primary actions: `Take guided tour`, `Open live application`.
- Secondary actions: `View source`, `Explore architecture`.
- A cloned and enlarged Command Field composition on the right using `211:127` as the source.
- A compact proof rail containing `17 priority signals`, `6 workflow states`, `12 audit events`, and `4 verification layers`.

Use this font helper before text mutation:

```js
async function loadTextFont(node) {
  if (!node || node.type !== 'TEXT') return;
  const segments = node.getStyledTextSegments(['fontName']);
  for (const segment of segments) await figma.loadFontAsync(segment.fontName);
}
```

Expected: the frame reads as a portfolio opening, not an application dashboard.

- [ ] **Step 2: Create the initialization state from the resolved frame**

Clone P01 into `P00 / Showcase / Initial` and preserve layer names. Modify only resting properties:

- Thesis, supporting copy, badges, proof rail, and buttons: opacity 0.
- Command Field: opacity 0.18, scale 0.94, translated 28 px right.
- Grid: opacity 0.15.
- Wordmark: opacity 0.45.
- Scan line: positioned at the upper edge.

Expected: Smart Animate can map every major layer by name.

- [ ] **Step 3: Add the timed initialization transition**

Use a 2.1-second timeout and 0.9-second Smart Animate transition from P00 to P01.

```js
const cinematicTransition = {
  type: 'SMART_ANIMATE',
  easing: {
    type: 'CUSTOM_CUBIC_BEZIER',
    easingFunctionCubicBezier: { x1: 0.22, y1: 1, x2: 0.36, y2: 1 }
  },
  duration: 0.9
};

await initialFrame.setReactionsAsync([{
  trigger: { type: 'AFTER_TIMEOUT', timeout: 2.1 },
  actions: [{
    type: 'NODE',
    destinationId: readyFrame.id,
    navigation: 'NAVIGATE',
    transition: cinematicTransition,
    preserveScrollPosition: false
  }]
}]);
```

Expected: the prototype opens near-black and resolves into the finished hero without blocking manual navigation after the transition.

- [ ] **Step 4: Add showcase actions**

Wire:

- `Take guided tour` → P02.
- `Open live application` → P02, but use a faster 0.35-second transition and label the hotspot `HOTSPOT / Open live application`.
- `Explore architecture` → P13.
- `View source` → a small source-details overlay inside P13 rather than an external URL, because prototype external navigation is not required for this artifact.

Expected: every visible call to action has a destination.

- [ ] **Step 5: Verify showcase resting states**

Capture screenshots of P00 and P01 at 1440 px maximum dimension.

Expected: no text clipping, no button collision, Command Field remains the visual signature, and P00 remains understandable without animation.

---

### Task 3: Create the reusable guided-tour controller

**Files:**
- Create: reusable controller frame and six cloned instances inside P02, P03, P04, P06, P10, and P13
- Create: six technical-details overlays

**Interfaces:**
- Consumes: step number, title, why-it-matters copy, technical proof copy, previous destination, next destination, and exit destination.
- Produces: consistent tour navigation and technical-detail expansion.

- [ ] **Step 1: Create the controller visual**

Build a 392 × 158 floating panel named `TOUR / Controller` with:

- Step counter such as `01 / 06`.
- Step title.
- One-line `Why it matters` explanation.
- `Previous`, `Next`, `Exit tour`, and `Technical details` actions.
- Six-segment progress indicator.
- Dark glass surface, one-pixel cyan edge, and a restrained teal active segment.

Expected: body copy remains at least 11 px and actions remain visually distinct.

- [ ] **Step 2: Define the six controller content sets**

Use these exact titles and summaries:

| Step | Title | Why it matters | Technical proof |
|---|---|---|---|
| 1 | `Read portfolio pressure` | `Decision-first prioritization exposes risk before work stalls.` | `Angular services, signals, aggregated portfolio API.` |
| 2 | `Open the urgent claim` | `Queue state combines urgency, ownership, and evidence posture.` | `Filter state, selected-row context, REST-backed data.` |
| 3 | `Inspect the evidence trail` | `Every recommendation remains traceable to source evidence.` | `Claim, evidence, recommendation, and audit domains.` |
| 4 | `Keep authority human` | `Assistance cannot commit a claim decision without an operator.` | `Validated transition, reason capture, immutable audit event.` |
| 5 | `Create a review-ready record` | `The backend remains authoritative for priority and completeness.` | `Reactive form, upload state, submission, backend triage.` |
| 6 | `Inspect the engineering proof` | `The interface is backed by a real full-stack system.` | `Angular 20, Spring Boot, PostgreSQL, testing, accessibility.` |

Expected: no controller contains generic placeholder language.

- [ ] **Step 3: Create technical-details overlays**

Create six 460 × 280 overlay frames, one per step, with the matching technical proof plus:

- `Frontend`
- `Backend`
- `Persistence`
- `Verification`
- `Close` action

Expected: overlays use violet only for intelligence-related content and do not overpower the application screen.

- [ ] **Step 4: Add the reaction helpers**

```js
const fastSmart = {
  type: 'SMART_ANIMATE',
  easing: {
    type: 'CUSTOM_CUBIC_BEZIER',
    easingFunctionCubicBezier: { x1: 0.22, y1: 1, x2: 0.36, y2: 1 }
  },
  duration: 0.45
};

async function setNavigate(node, destination, transition = fastSmart) {
  await node.setReactionsAsync([{
    trigger: { type: 'ON_CLICK' },
    actions: [{
      type: 'NODE',
      destinationId: destination.id,
      navigation: 'NAVIGATE',
      transition,
      preserveScrollPosition: false
    }]
  }]);
}

async function setOverlay(node, destination) {
  await node.setReactionsAsync([{
    trigger: { type: 'ON_CLICK' },
    actions: [{
      type: 'NODE',
      destinationId: destination.id,
      navigation: 'OVERLAY',
      transition: {
        type: 'DISSOLVE',
        easing: { type: 'EASE_OUT' },
        duration: 0.2
      }
    }]
  }]);
}
```

Expected: all navigation uses one consistent transition contract.

---

### Task 4: Build tour step 1, Portfolio Pressure

**Files:**
- Create: `P02 / Tour / Portfolio Pressure`
- Clone from: `211:56`

**Interfaces:**
- Consumes: P01 showcase entry and canonical Operations Overview.
- Produces: queue-entry actions and controller navigation to P03.

- [ ] **Step 1: Clone Operations Overview into a viewport frame**

Clone `211:56`, preserve all internal layer names, and nest it inside a new 1440 × 1024 clipped frame named P02.

Expected: no visual scaling or source mutation.

- [ ] **Step 2: Add step-specific focus treatment**

Add:

- A restrained cyan focus ring around `211:127` equivalent in the clone.
- A red pulse edge around the cloned urgent claim equivalent of `211:184`.
- A short callout: `17 claims require intervention before end of day.`
- Controller step 1.

Expected: focus styling indicates the intended reading order without dimming the entire application below accessible contrast.

- [ ] **Step 3: Wire all valid queue paths**

Wire the cloned equivalents of:

- nav Claims `211:96`
- urgent claim `211:184`
- open prioritized queue `211:201`

All navigate to P03.

Wire cloned Create Claim `211:123` to P10.

Expected: both guided and exploratory paths work.

- [ ] **Step 4: Wire controller actions**

- Previous → P01.
- Next → P03.
- Exit tour → P01.
- Technical details → step-1 overlay.

Expected: no controller action is inert.

---

### Task 5: Build tour step 2, Prioritized Queue

**Files:**
- Create: `P03 / Tour / Prioritized Queue`
- Clone from: `211:329`

**Interfaces:**
- Consumes: P02 queue navigation.
- Produces: selected-claim transition to P04 and intake navigation to P10.

- [ ] **Step 1: Clone Claims Queue into P03**

Clone `211:329` into a 1440 × 1024 viewport frame.

Expected: the canonical selected row, inspector, filter state, and active navigation remain intact.

- [ ] **Step 2: Strengthen selected-claim causality**

Add:

- A cyan trace from cloned selected row `211:472` to inspector `211:592`.
- A red-to-amber SLA callout attached to cloned claim ID `211:476`.
- A label: `Urgency + missing evidence + ownership state`.
- Controller step 2.

Expected: the relationship between row selection and inspector context is obvious.

- [ ] **Step 3: Wire queue interactions**

Wire the cloned equivalents of:

- selected row `211:472`
- claim ID `211:476`
- Open workspace `211:644`

All navigate to P04.

Wire nav Overview `211:366` to P02 and Create Claim `211:395` plus nav New Claim `211:375` to P10.

Expected: queue navigation supports both the guided path and free exploration.

- [ ] **Step 4: Wire controller actions**

- Previous → P02.
- Next → P04.
- Exit tour → P01.
- Technical details → step-2 overlay.

---

### Task 6: Build claim investigation and evidence states

**Files:**
- Create: `P04 / Tour / Claim Investigation`, `P05 / Tour / Evidence Review`
- Clone from: `211:658`

**Interfaces:**
- Consumes: P03 selected claim.
- Produces: tab navigation, evidence-focused state, and transition to P06.

- [ ] **Step 1: Create a clipped workspace viewport**

Create P04 at 1440 × 1024. Append a clone of `211:658`, keep it at x 0, y 0, and enable clipping on P04.

Expected: identity, tabs, dossier, evidence ledger, and decision rail appear in one viewport; lower audit content remains scroll-context rather than destructively removed.

- [ ] **Step 2: Add investigation callouts**

Highlight:

- Claim identity.
- Evidence ledger.
- Decision support rail.

Add the copy: `Four domains converge here: claim, evidence, recommendation, and audit.`

Place controller step 3 without covering approve/reject controls.

Expected: evidence remains the primary focal area.

- [ ] **Step 3: Create P05 from P04**

Clone P04 into P05, preserve names, then:

- Move active tab indicator from Overview to Evidence.
- Intensify the two missing evidence rows.
- Add a narrow violet-to-amber evidence trace from missing items toward decision support.
- Change controller subtitle to `Evidence review state` while retaining step 3 numbering.

Expected: Smart Animate makes the tab change and evidence emphasis feel causally connected.

- [ ] **Step 4: Wire workspace tabs and navigation**

In P04:

- Evidence tab → P05.
- Decision Support tab → P06.
- Back to Claims → P03.

In P05:

- Overview tab → P04.
- Decision Support tab → P06.
- Back to Claims → P03.

Controller P04/P05:

- Previous → P03.
- Next → P06.
- Exit → P01.
- Technical details → step-3 overlay.

Expected: both tabs and guided controls reach the decision step.

---

### Task 7: Build the human-decision path

**Files:**
- Create: `P06 / Tour / Human Decision`, `P07 / Overlay / Approve Decision`, `P08 / Overlay / Reject Decision`, `P09 / State / Decision Confirmed`
- Clone from: P04/P05 workspace viewport

**Interfaces:**
- Consumes: evidence-reviewed claim state.
- Produces: approve path, reject path, explicit reason capture, success state, and audit append.

- [ ] **Step 1: Create the decision-focused workspace state**

Clone P04 into P06 and:

- Move active tab indicator to Decision Support.
- Add a restrained violet intelligence field behind the recommendation panel.
- Add a teal authority edge around the human-review notice and decision buttons.
- Add copy: `Recommendation is advisory. The operator owns the transition.`
- Add controller step 4.

Expected: approve and reject controls are visually stronger than the AI badge.

- [ ] **Step 2: Build the approve overlay**

Create a 520 × 420 overlay with:

- `Approve recommendation` title.
- Claim ID and recommendation summary.
- Required `Decision reason` field with entered sample text: `Evidence request is appropriate before final review.`
- `Confirm approval` and `Cancel` buttons.
- Human-authority notice.

Expected: no action implies automatic approval.

- [ ] **Step 3: Build the reject overlay**

Clone the approve overlay and change:

- Title to `Reject recommendation`.
- Reason to `Coverage context requires manual review before requesting more evidence.`
- Primary action to `Confirm rejection`.
- Accent from teal to amber, not red, because rejection is a controlled decision rather than an error.

- [ ] **Step 4: Build the confirmed state**

Clone P06 into P09 and:

- Change recommendation status to `REVIEWED`.
- Replace the two action buttons with `Decision recorded` and `View audit event`.
- Add a success strip: `Operator decision saved. Audit event appended.`
- Shift the nested workspace clone upward enough to reveal the audit timeline.
- Add a new audit event: `12:04 · Guidance approved by Yoshi Gomez`.

Expected: the result is visible in both recommendation and audit surfaces.

- [ ] **Step 5: Wire decision reactions**

- P06 Approve button → P07 overlay.
- P06 Reject button → P08 overlay.
- P07 Cancel → P06.
- P08 Cancel → P06.
- P07 Confirm approval → P09.
- P08 Confirm rejection → P09.
- P09 Next → P10.
- P09 Previous → P06.
- P09 View audit event → P09 with a scroll-position-preserving highlight state if supported; otherwise keep the visible event callout.

Expected: both approve and reject paths converge on an auditable outcome.

---

### Task 8: Build new-claim intake and submission states

**Files:**
- Create: `P10 / Tour / New Claim Intake`, `P11 / State / Upload Resolved`, `P12 / State / Claim Created`
- Clone from: `211:962`

**Interfaces:**
- Consumes: guided-tour transition from P09 and free navigation from P02/P03.
- Produces: retry success, submission result, and transition to technical proof.

- [ ] **Step 1: Create the clipped intake viewport**

Create P10 at 1440 × 1024. Append a clone of `211:962`, set the nested clone to y = -250, and clip overflow so evidence and submission controls are visible.

Add controller step 5.

Expected: upload state, checklist, and create-record action are visible within one viewport.

- [ ] **Step 2: Add intake-specific explanation**

Add:

- Callout on upload failure: `Draft remains safe. Retry is explicit.`
- Callout on authority note: `Backend calculates authoritative priority and completeness.`
- Focus edge on Create Claim Record.

Expected: the state communicates recovery and backend authority.

- [ ] **Step 3: Create upload-resolved state**

Clone P10 into P11 and replace the failed upload row with:

- Teal success icon.
- `scene-photos.zip`.
- `8.7 MB · Uploaded`.
- Remove Retry button.
- Update evidence count and form completion to `92%`.

Expected: Smart Animate communicates state recovery without a full-page transition.

- [ ] **Step 4: Create claim-created state**

Clone P11 into P12 and add a full-width success layer:

- `Claim CF-2026-0148 created`.
- `Backend triage complete`.
- Priority `HIGH`.
- Completeness `92%`.
- Audit event `Claim created by Yoshi Gomez`.
- Actions `Open claim workspace` and `Continue to technical proof`.

Expected: the created state proves a backend-oriented workflow without pretending to execute an API call in Figma.

- [ ] **Step 5: Wire intake reactions**

- P10 Retry `211:1193` equivalent → P11.
- P10/P11 Create Claim Record `211:1198` equivalent → P12.
- P12 Continue to technical proof → P13.
- P12 Open claim workspace → P04.
- Controller Previous → P09.
- Controller Next → P13.
- Exit → P01.
- Technical details → step-5 overlay.

---

### Task 9: Build the technical-proof finale

**Files:**
- Create: `P13 / Tour / Technical Proof`

**Interfaces:**
- Consumes: P12 completion and P01 Explore Architecture.
- Produces: architecture explanation, verification summary, source handoff, restart, and application exploration actions.

- [ ] **Step 1: Create the architecture signal map**

Build a 1440 × 1024 frame with five connected layers:

```text
Angular 20 interface
REST API boundary
Spring Boot services
Domain policies
PostgreSQL + immutable audit history
```

Use animated-direction line styling, but keep all labels legible in the resting state.

Expected: no floating technology-logo collage; the diagram explains data flow and responsibility boundaries.

- [ ] **Step 2: Add verification proof**

Create four evidence cards:

- `Frontend`: standalone components, signals, reactive forms.
- `Backend`: services, validation, controlled transitions.
- `Persistence`: PostgreSQL transactions and audit history.
- `Verification`: unit, component, integration, end-to-end, and visual regression strategy.

Add performance targets: `LCP ≤ 2.5s`, `INP ≤ 200ms`, `CLS ≤ 0.1`.

Expected: technical claims remain specific and consistent with the approved spec.

- [ ] **Step 3: Add final actions and controller**

Actions:

- `Continue exploring` → P02.
- `Restart guided tour` → P02.
- `Return to showcase` → P01.
- `View source` → source-details overlay containing repository name `bbfosho0/ClaimsFlow` and implementation stack.

Controller step 6:

- Previous → P10.
- Next → P02, labeled `Explore product`.
- Exit → P01.
- Technical details → step-6 overlay.

---

### Task 10: Add key mobile and reduced-motion references

**Files:**
- Create: `P14 / Mobile / Showcase`, `P15 / Mobile / Tour Controller`, `P16 / Notes / Reduced Motion`

**Interfaces:**
- Consumes: showcase and controller visual system.
- Produces: handoff evidence for mobile compression and reduced-motion behavior.

- [ ] **Step 1: Build the 390 × 844 mobile showcase**

Include:

- Compact ClaimsFlow identity.
- Thesis and two primary actions.
- Simplified static Command Field.
- Technology proof badges arranged in two columns.
- No full-screen shader or continuous motion.

Expected: the hero remains portfolio-grade without desktop density.

- [ ] **Step 2: Build the mobile tour controller state**

Create a 390 × 844 decision-focused mobile frame with:

- Product surface in the upper region.
- Bottom-sheet tour controller.
- Step 4 human-authority copy.
- Approve and reject controls above the safe-area boundary.

Expected: controller does not cover the primary decision controls.

- [ ] **Step 3: Document reduced-motion behavior**

Create P16 as a handoff frame containing:

- P00 jumps directly to P01 with a short dissolve.
- Shared-element transitions become immediate state changes.
- Radar and telemetry stop at their meaningful resting state.
- Controller, decision, and audit information remain fully visible.
- No information depends on movement, hover, or pointer position.

Expected: the reduced-motion contract is explicit rather than implied.

---

### Task 11: Add optional Figma Motion only when supported

**Files:**
- Modify: descendants of P01 only
- Verify with: `get_motion_context`, optionally `export_video`

**Interfaces:**
- Consumes: completed P01 resting state.
- Produces: optional bounded radar motion that does not affect prototype navigation.

- [ ] **Step 1: Probe Motion support safely**

Read motion context on P01. If manual track setters or timeline methods return `not a supported API`, stop this task and retain Smart Animate only.

Expected: no repeated unsupported calls.

- [ ] **Step 2: Add bounded descendant tracks when supported**

Animate only:

- Radar ring rotation, one slow 360-degree cycle.
- Focus glow opacity, 0.45 → 0.9 → 0.45.
- Scan line translation across the Command Field.

Do not animate the top-level frame itself.

Expected: one timeline, no motion inside operational tour frames.

- [ ] **Step 3: Verify motion with video export**

Use the top-level P01 frame as the timeline root, 30 fps, low or medium quality.

Expected: animation remains bounded and does not shift layout or text.

---

### Task 12: Reaction audit and visual QA

**Files:**
- Inspect: every P00–P16 frame and overlay
- Preserve: canonical source frames

**Interfaces:**
- Consumes: all prototype frames and exact node IDs.
- Produces: verified reaction map, screenshot set, source immutability proof, and final Figma links.

- [ ] **Step 1: Programmatically audit reactions**

Return a table containing:

- Source node ID and name.
- Trigger type.
- Destination node ID and name.
- Navigation type.
- Transition type and duration.

Expected: no visible primary action is missing a reaction.

- [ ] **Step 2: Audit prototype frame inventory**

Verify exact frame names P00 through P16, unique IDs, expected dimensions, and section membership.

Expected: no duplicate prototype names and no frame outside the dedicated section.

- [ ] **Step 3: Recheck canonical source immutability**

Compare source name, position, size, and child count against Task 1 values.

Expected: `211:56`, `211:329`, `211:658`, and `211:962` remain unchanged.

- [ ] **Step 4: Capture visual screenshots**

At minimum capture:

- P00
- P01
- P02
- P03
- P04
- P06
- P07
- P09
- P10
- P12
- P13
- P14
- P15
- P16

Expected: no clipping, collision, unreadable text, or controller obstruction.

- [ ] **Step 5: Correct defects one frame at a time**

For each screenshot defect:

1. Resolve exact affected node IDs.
2. Load fonts for affected text.
3. Apply the smallest targeted mutation.
4. Re-capture the affected frame.
5. Re-capture the containing section only after the frame is correct.

Expected: no broad reruns or accidental duplicate layers.

- [ ] **Step 6: Produce final handoff**

Return:

- Figma link to P00.
- Figma link to P01.
- Figma link to P02.
- Figma link to P13.
- Prototype frame registry with node IDs.
- Motion verification status.
- Any manual Figma requirement, such as selecting P00 as the presentation start point if `flowStartingPoints` remains read-only.
- Confirmation that production code was not modified.

---

## Plan Self-Review Checklist

- [ ] Every approved showcase chapter is represented.
- [ ] All six guided-tour steps have a frame, controller content, and technical-details overlay.
- [ ] Both approve and reject paths require a reason and append an audit outcome.
- [ ] New Claim demonstrates retry, submission, triage, and created state.
- [ ] Technical proof covers architecture, verification, accessibility, and performance.
- [ ] Mobile and reduced-motion references are explicit.
- [ ] Canonical final frames remain unchanged.
- [ ] Smart Animate is sufficient when Figma Motion is unavailable.
- [ ] No production implementation occurs during this plan.
- [ ] No visible action remains inert.
