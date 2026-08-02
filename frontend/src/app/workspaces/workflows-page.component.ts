import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface LibraryItem {
  readonly title: string;
  readonly detail: string;
  readonly tone: string;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page workflow-workspace page-enter">
      <div class="workflow-topbar">
        <nav aria-label="Workflow sections"><button class="active">Builder</button><button>Settings</button><button>Versions</button><button>Test & Simulate</button><button>Audit Trail</button></nav>
        <span>All changes saved</span>
        <button>Save</button><button>Validate</button><button class="primary">Activate</button>
      </div>

      <div class="figma-workflow-layout">
        <aside class="workspace-panel component-library">
          <header><strong>Components</strong></header>
          <label><span class="sr-only">Search workflow components</span><input placeholder="Search components…" /></label>
          <section *ngFor="let group of libraryGroups">
            <h3>{{ group.label }}</h3>
            <button *ngFor="let item of group.items"><i [attr.data-tone]="item.tone"></i><span><strong>{{ item.title }}</strong><small>{{ item.detail }}</small></span></button>
          </section>
        </aside>

        <section class="workspace-panel figma-workflow-canvas">
          <div class="canvas-toolbar"><span>Zoom 100% · − · +</span><button>Auto Arrange</button></div>
          <div class="builder-canvas" aria-label="Property claim workflow canvas">
            <svg class="workflow-connectors" viewBox="0 0 608 720" aria-hidden="true">
              <path d="M304 88V118"/><path d="M304 198V238H175V270"/><path d="M304 238H438V270"/>
              <path d="M175 352V392"/><path d="M438 352V392"/><path d="M175 474V518H304V548"/><path d="M438 474V518H304"/>
              <path d="M304 630V670"/><path d="M304 670H165V694"/><path d="M304 670H444V694"/>
            </svg>
            <span class="branch-pill branch-yes">YES</span><span class="branch-pill branch-no">NO</span>
            <article *ngFor="let node of nodes; let index = index" class="workflow-node-figma" [attr.data-index]="index" [attr.data-tone]="node.tone" [class.selected]="selectedNode() === index" (click)="selectedNode.set(index)">
              <i aria-hidden="true"></i><div><span>{{ node.kind }}</span><strong>{{ node.title }}</strong><small>{{ node.detail }}</small></div>
            </article>
          </div>
        </section>

        <aside class="workspace-panel condition-inspector">
          <header><div><span>CONDITION</span><strong>Policy Active?</strong><small>Check whether the policy is active and not expired.</small></div></header>
          <label>Logic Type<select><option>All Conditions (AND)</option></select></label>
          <h3>CONDITIONS</h3>
          <div class="condition-row"><span>Policy Status</span><small>equals</small><strong>Active</strong></div>
          <div class="condition-row"><span>Expiry Date</span><small>greater than</small><strong>Today</strong></div>
          <button class="add-condition">+ Add Condition</button>
          <label>Else Path<select><option>Policy inactive or expired</option></select></label>
          <h3>ADVANCED</h3>
          <div class="advanced-row"><span>Case Sensitivity</span><i></i></div>
          <div class="advanced-row"><span>Stop on First Match</span><i class="active"></i></div>
          <h3>TEST CONDITION</h3>
          <div class="test-controls"><select><option>Active</option></select><button type="button" (click)="runSimulation()">Run Test</button></div>
          <div class="matched-result"><strong>MATCHED</strong><span>True · 2 conditions · 12ms</span></div>
        </aside>
      </div>

      <section class="workspace-panel simulation-mode">
        <button class="simulation-play" type="button" (click)="runSimulation()" aria-label="Run workflow simulation">▶</button>
        <div><span>STANDARD PROPERTY CLAIM</span><strong>$18,750 · Policy Active</strong></div>
        <div class="simulation-progress"><strong>COMPLETED SUCCESSFULLY</strong><span>8 / 8 steps · 1.2s</span><i><b *ngFor="let step of simulationSteps"></b></i><span class="sr-only">{{ simulationState() === 'passed' ? 'Local simulation passed' : 'Ready to simulate' }}</span></div>
        <div class="simulation-insights"><span>INSIGHTS</span><p>✓ Auto-adjudication path selected</p><p>✓ High confidence score: 82%</p><p>✓ Claim auto-approved</p></div>
        <div class="simulation-metrics"><span>METRICS</span><strong>82% <em>SUCCESS</em></strong><p>Approval probability 82% · Risk low · 1.2s processing</p></div>
      </section>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowsPageComponent {
  readonly selectedNode = signal(1);
  readonly simulationState = signal<'idle' | 'passed'>('passed');
  readonly simulationSteps = Array.from({ length: 8 });
  readonly libraryGroups: readonly { label: string; items: readonly LibraryItem[] }[] = [
    {
      label: 'TRIGGERS',
      items: [
        { title: 'Claim Created', detail: 'New claim submitted', tone: 'green' },
        { title: 'Document Received', detail: 'Required document uploaded', tone: 'violet' },
        { title: 'Event Occurred', detail: 'Specific system event', tone: 'critical' },
      ],
    },
    {
      label: 'LOGIC',
      items: [
        { title: 'Condition', detail: 'If / else logic', tone: 'green' },
        { title: 'Decision Table', detail: 'Multi-branch decision', tone: 'blue' },
        { title: 'Score Check', detail: 'Evaluate risk or score', tone: 'violet' },
        { title: 'Business Rule', detail: 'Custom rule evaluation', tone: 'amber' },
      ],
    },
    {
      label: 'ACTIONS',
      items: [
        { title: 'Assign Task', detail: 'Create task for team', tone: 'amber' },
        { title: 'Send Notification', detail: 'Email, SMS, in-app', tone: 'cyan' },
        { title: 'Update Claim', detail: 'Update claim information', tone: 'green' },
        { title: 'Create Document', detail: 'Generate document', tone: 'violet' },
      ],
    },
  ];
  readonly nodes = [
    { kind: 'TRIGGER', title: 'Claim Created', detail: 'When property claim is submitted', tone: 'green' },
    { kind: 'CONDITION', title: 'Policy Active?', detail: 'Is policy active and not expired?', tone: 'blue' },
    { kind: 'CONDITION', title: 'Claim Amount', detail: 'Estimated amount ≤ $25,000?', tone: 'violet' },
    { kind: 'ACTION', title: 'Send Notification', detail: 'Notify customer of ineligibility', tone: 'amber' },
    { kind: 'AI ACTION', title: 'Auto-Adjudicate', detail: 'Evaluate and recommend settlement', tone: 'violet' },
    { kind: 'APPROVAL', title: 'Manager Review', detail: 'Required for $25k–$100k', tone: 'amber' },
    { kind: 'CONDITION', title: 'AI Confidence Score', detail: 'Confidence score ≥ 75%', tone: 'blue' },
    { kind: 'ACTION', title: 'Approve Claim', detail: 'Update status automatically', tone: 'green' },
    { kind: 'ACTION', title: 'Escalate to Adjuster', detail: 'Send for senior review', tone: 'amber' },
    { kind: 'ACTION', title: 'Update Claim', detail: 'Close workflow and write audit', tone: 'cyan' },
  ];

  runSimulation(): void {
    this.simulationState.set('passed');
  }
}
