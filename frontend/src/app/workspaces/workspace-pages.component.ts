import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injectable, computed, inject, signal } from '@angular/core';

interface AnalyticsMetric {
  readonly label: string;
  readonly value: string;
  readonly trend: string;
  readonly tone: 'cyan' | 'blue' | 'violet' | 'green' | 'magenta' | 'amber';
}

interface DocumentRecord {
  readonly name: string;
  readonly type: string;
  readonly status: string;
  readonly size: string;
  readonly confidence: number;
  readonly summary: string;
}

interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly active: number;
  readonly capacity: number;
  readonly sla: string;
}

interface WorkflowNode {
  readonly kind: string;
  readonly title: string;
  readonly detail: string;
  readonly tone: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceDataService {
  readonly analyticsMetrics: readonly AnalyticsMetric[] = [
    { label: 'Total Payouts (MTD)', value: '$4.73M', trend: '↑ 18% vs prior 30 days', tone: 'cyan' },
    { label: 'Open Claims', value: '1,389', trend: '↑ 12% vs prior 30 days', tone: 'blue' },
    { label: 'Avg. Resolution Time', value: '4.2 days', trend: '↓ 0.6 days vs prior', tone: 'violet' },
    { label: 'Approval Rate', value: '76.8%', trend: '↑ 5.4% vs prior', tone: 'green' },
    { label: 'Claims Received', value: '2,143', trend: '↑ 9% vs prior', tone: 'magenta' },
    { label: 'Fraud Detection Savings', value: '$621K', trend: '↑ 14% vs prior', tone: 'amber' },
  ];

  readonly documents: readonly DocumentRecord[] = [
    { name: 'Loss Assessment.pdf', type: 'Assessment', status: 'Verified', size: '2.4 MB', confidence: 98, summary: 'Independent assessment confirms structural water damage across the north wing.' },
    { name: 'Police Report.pdf', type: 'Official report', status: 'Reviewed', size: '1.8 MB', confidence: 96, summary: 'Report confirms incident timing, parties involved, and the responding officer narrative.' },
    { name: 'Damage Photos.zip', type: 'Evidence bundle', status: 'Indexed', size: '48.2 MB', confidence: 93, summary: 'Twenty-four timestamped photos grouped by room and severity.' },
    { name: 'Policy Endorsement.pdf', type: 'Policy', status: 'Needs review', size: '620 KB', confidence: 89, summary: 'Endorsement modifies water-damage sublimits and temporary accommodation terms.' },
  ];

  readonly team: readonly TeamMember[] = [
    { name: 'Priya Shah', role: 'Senior Adjuster', active: 14, capacity: 18, sla: '98.4%' },
    { name: 'Marcus Reed', role: 'Property Specialist', active: 11, capacity: 16, sla: '96.8%' },
    { name: 'Elena Torres', role: 'Complex Claims', active: 9, capacity: 15, sla: '99.1%' },
    { name: 'Jordan Kim', role: 'Triage Lead', active: 12, capacity: 14, sla: '94.6%' },
  ];

  readonly workflowNodes: readonly WorkflowNode[] = [
    { kind: 'Trigger', title: 'Claim created', detail: 'Property · severity high', tone: 'cyan' },
    { kind: 'Condition', title: 'Evidence score', detail: 'Below 80% completeness', tone: 'violet' },
    { kind: 'AI action', title: 'Summarize evidence', detail: 'Generate review brief', tone: 'magenta' },
    { kind: 'Approval', title: 'Human review', detail: 'Claims manager required', tone: 'amber' },
    { kind: 'Action', title: 'Assign specialist', detail: 'Property Response team', tone: 'green' },
  ];
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page analytics-workspace page-enter">
      <div class="workspace-filterbar">
        <button type="button" [class.active]="range() === 'Last 30 days'" (click)="setRange('Last 30 days')">Last 30 days <span>⌄</span></button>
        <button type="button" [class.active]="range() === 'Quarter to date'" (click)="setRange('Quarter to date')">Quarter to date <span>⌄</span></button>
        <button type="button">Line of Business · All <span>⌄</span></button>
        <button type="button">Claim Type · All <span>⌄</span></button>
        <button type="button">Region · All <span>⌄</span></button>
        <button type="button" class="export-control">Export Report <span>⌄</span></button>
      </div>

      <div class="metric-grid six-up">
        <article *ngFor="let metric of metrics()" class="workspace-metric" [attr.data-tone]="metric.tone">
          <div class="metric-accent" aria-hidden="true"></div>
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.trend }}</small>
          <i class="sparkline" aria-hidden="true"><b></b><b></b><b></b><b></b><b></b></i>
        </article>
      </div>

      <div class="analytics-grid">
        <article class="workspace-panel span-5">
          <header><strong>Payout Trends</strong><span>Actual vs forecast</span></header>
          <div class="line-chart" aria-label="Payout trend chart"><i></i><b></b></div>
        </article>
        <article class="workspace-panel span-4">
          <header><strong>Resolution Performance</strong><span>Target 4.5 days</span></header>
          <div class="line-chart compact" aria-label="Resolution chart"><i></i><b></b></div>
        </article>
        <article class="workspace-panel span-3 region-panel">
          <header><strong>Claims by Region</strong><span>Paid amount</span></header>
          <div class="region-map" aria-hidden="true"></div>
          <ul><li>N. America <b>$2.11M</b></li><li>Europe <b>$1.04M</b></li><li>Asia Pacific <b>$862K</b></li></ul>
        </article>

        <article class="workspace-panel span-3">
          <header><strong>Approval Funnel</strong><span>2,143 received</span></header>
          <div class="funnel"><i></i><i></i><i></i><i></i></div>
        </article>
        <article class="workspace-panel span-3 donut-panel">
          <header><strong>Severity Mix</strong><span>Active portfolio</span></header>
          <div class="donut"><b>1,389</b></div>
        </article>
        <article class="workspace-panel span-4">
          <header><strong>Cohort Analysis</strong><span>Resolution by age</span></header>
          <div class="heatmap"><i *ngFor="let cell of heatmap; let index = index" [style.opacity]="0.35 + ((index % 6) * 0.1)">{{ 36 - index }}</i></div>
        </article>
        <article class="workspace-panel span-2 benchmark-panel">
          <header><strong>Operational Benchmarks</strong><span>vs target</span></header>
          <div *ngFor="let benchmark of benchmarks"><span>{{ benchmark.label }}</span><b>{{ benchmark.value }}</b><i><em [style.width.%]="benchmark.score"></em></i></div>
        </article>

        <article class="workspace-panel span-4 insight-list">
          <header><strong>Trended Insights</strong><span>Generated now</span></header>
          <p><i data-tone="cyan"></i>Payouts increased 18%, led by North America.</p>
          <p><i data-tone="blue"></i>Resolution improved 0.6 days.</p>
          <p><i data-tone="amber"></i>High-severity claims decreased 8%.</p>
        </article>
        <article class="workspace-panel span-4 category-panel">
          <header><strong>Top Claim Categories by Payout</strong><span>Month to date</span></header>
          <div *ngFor="let category of categories"><span>{{ category.label }}</span><i><em [style.width.%]="category.score"></em></i><b>{{ category.value }}</b></div>
        </article>
        <article class="workspace-panel span-4 fraud-panel">
          <header><strong>Fraud Detection Impact</strong><span>Decision intelligence</span></header>
          <div><article><span>Fraud Cases Detected</span><strong>134</strong><small>↑ vs prior</small></article><article><span>Fraud Savings</span><strong>$621K</strong><small>↑ vs prior</small></article><article><span>Confirmed Fraud Rate</span><strong>6.2%</strong><small>↑ vs prior</small></article></div>
        </article>
      </div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageComponent {
  private readonly data = inject(WorkspaceDataService);
  readonly range = signal('Last 30 days');
  readonly heatmap = Array.from({ length: 30 });
  readonly benchmarks = [
    { label: 'First response', value: '1.6h', score: 72 },
    { label: 'Resolution', value: '4.2d', score: 78 },
    { label: 'Approval', value: '76.8%', score: 84 },
    { label: 'Accuracy', value: '98.7%', score: 94 },
  ];
  readonly categories = [
    { label: 'Property Damage', value: '$1.42M', score: 90 },
    { label: 'Liability', value: '$1.18M', score: 76 },
    { label: 'Medical', value: '$992K', score: 62 },
    { label: 'Auto Damage', value: '$678K', score: 48 },
  ];
  readonly metrics = computed(() => this.data.analyticsMetrics.map((metric, index) =>
    this.range() === 'Quarter to date' && index === 0 ? { ...metric, value: '$12.86M', trend: '↑ 21% vs prior quarter' } : metric,
  ));

  setRange(range: string): void { this.range.set(range); }
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page documents-workspace page-enter">
      <div class="workspace-tabs"><button class="active">Documents</button><button>Communications</button><button>Activity</button><button class="upload-button">Upload evidence</button></div>
      <div class="documents-layout">
        <aside class="workspace-panel folder-rail">
          <header><strong>Folders</strong><span>128 files</span></header>
          <button class="active">All documents <b>128</b></button><button>Evidence <b>54</b></button><button>Policy <b>18</b></button><button>Correspondence <b>36</b></button><button>Reports <b>20</b></button>
          <div class="integrity-card"><span>DOCUMENT INTEGRITY</span><strong>96.4%</strong><i><b></b></i><small>All critical evidence has a verified source.</small></div>
        </aside>

        <section class="workspace-panel document-list">
          <header><div><strong>Claim documents</strong><span>CF-2026-0142 · Morgan Ellis</span></div><button>Filter ⌄</button></header>
          <button *ngFor="let document of documents" type="button" [class.active]="selectedDocument().name === document.name" (click)="selectDocument(document.name)">
            <i aria-hidden="true">▤</i><span><strong>{{ document.name }}</strong><small>{{ document.type }} · {{ document.size }}</small></span><b>{{ document.status }}</b>
          </button>
        </section>

        <section class="workspace-panel document-preview">
          <header><div><strong>{{ selectedDocument().name }}</strong><span>{{ selectedDocument().type }} · {{ selectedDocument().size }}</span></div><button>•••</button></header>
          <div class="preview-sheet"><span>CLAIM EVIDENCE</span><strong>{{ selectedDocument().name }}</strong><i></i><i></i><i></i><i></i><p>{{ selectedDocument().summary }}</p></div>
          <div class="extraction-grid"><article><span>OCR confidence</span><strong>{{ selectedDocument().confidence }}%</strong></article><article><span>Integrity</span><strong>Verified</strong></article><article><span>Version</span><strong>v3</strong></article></div>
          <div class="entity-tags"><span>Water damage</span><span>North wing</span><span>$48,200 estimate</span><span>Policy verified</span></div>
        </section>

        <section class="workspace-panel communications-panel">
          <header><strong>Communication history</strong><button>New message</button></header>
          <ol><li><i data-tone="cyan"></i><div><strong>Claimant email received</strong><span>Additional accommodation receipts attached.</span></div><time>09:42</time></li><li><i data-tone="green"></i><div><strong>Adjuster note</strong><span>Loss assessment reconciled with photo evidence.</span></div><time>Yesterday</time></li><li><i data-tone="violet"></i><div><strong>AI summary refreshed</strong><span>Three new entities and one policy conflict detected.</span></div><time>Jul 31</time></li></ol>
        </section>

        <section class="workspace-panel ai-summary-panel"><header><strong>AI evidence summary</strong><span>Advisory</span></header><p>{{ selectedDocument().summary }}</p><div><span>Coverage match</span><strong>High confidence</strong></div><div><span>Review item</span><strong>Confirm sublimit</strong></div></section>
        <section class="workspace-panel comments-panel"><header><strong>Collaborative comments</strong><span>4 active</span></header><p><b>PS</b><span><strong>Priya Shah</strong> Confirm the accommodation sublimit before approval.</span></p><label><span class="sr-only">Add a comment</span><input placeholder="Add a comment…" /><button>Send</button></label></section>
      </div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsPageComponent {
  private readonly data = inject(WorkspaceDataService);
  readonly documents = this.data.documents;
  readonly selectedDocument = signal<DocumentRecord>(this.documents[0]);

  selectDocument(name: string): void {
    const document = this.documents.find(item => item.name === name);
    if (document) this.selectedDocument.set(document);
  }
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page team-workspace page-enter">
      <div class="workspace-filterbar team-filterbar"><button type="button" [class.active]="team() === 'All teams'" (click)="setTeam('All teams')">All teams <span>⌄</span></button><button type="button" [class.active]="team() === 'Property Response'" (click)="setTeam('Property Response')">Property Response <span>⌄</span></button><button type="button">Today <span>⌄</span></button><span class="selected-team">Viewing {{ team() }}</span></div>
      <div class="metric-grid six-up"><article class="workspace-metric" data-tone="cyan"><span>Active Claims</span><strong>248</strong><small>+12 today</small></article><article class="workspace-metric" data-tone="green"><span>SLA Compliance</span><strong>97.6%</strong><small>+1.8% this week</small></article><article class="workspace-metric" data-tone="amber"><span>At Risk</span><strong>17</strong><small>9 due today</small></article><article class="workspace-metric" data-tone="violet"><span>Avg. Load</span><strong>73%</strong><small>Balanced capacity</small></article><article class="workspace-metric" data-tone="blue"><span>Unassigned</span><strong>24</strong><small>4 above target</small></article><article class="workspace-metric" data-tone="magenta"><span>Quality Score</span><strong>96.8</strong><small>Top quartile</small></article></div>
      <div class="team-grid">
        <article class="workspace-panel capacity-overview"><header><strong>Workload & capacity</strong><span>Live ownership</span></header><div class="capacity-ring"><strong>73%</strong><span>utilized</span></div><div class="capacity-bars"><p *ngFor="let member of members"><span><b>{{ member.name }}</b><small>{{ member.active }} / {{ member.capacity }} active</small></span><i><em [style.width.%]="member.active / member.capacity * 100"></em></i><strong>{{ member.sla }}</strong></p></div></article>
        <article class="workspace-panel sla-panel"><header><strong>SLA command</strong><span>Next 8 hours</span></header><div class="sla-clock"><strong>01:48</strong><span>nearest breach</span></div><p><i data-tone="critical"></i><span><strong>CF-2026-0142</strong> Evidence review</span><b>1h 48m</b></p><p><i data-tone="amber"></i><span><strong>CF-2026-0134</strong> Manager approval</span><b>3h 12m</b></p><p><i data-tone="cyan"></i><span><strong>CF-2026-0128</strong> Owner assignment</span><b>5h 04m</b></p></article>
        <article class="workspace-panel recommendation-panel"><header><strong>Operations intelligence</strong><span>3 recommendations</span></header><p>Move two property claims to Elena Torres.</p><p>Open an approval focus block at 2:00 PM.</p><p>Assign the unowned evidence queue to triage.</p><button>Review recommendations →</button></article>
        <article class="workspace-panel queue-ownership"><header><strong>Queue ownership</strong><span>By team</span></header><div *ngFor="let queue of queues"><span>{{ queue.label }}</span><i><em [style.width.%]="queue.score"></em></i><b>{{ queue.value }}</b></div></article>
        <article class="workspace-panel shift-planner"><header><strong>Shift planner</strong><span>Coverage today</span></header><div class="shift-grid"><span *ngFor="let hour of hours">{{ hour }}</span><i *ngFor="let block of shiftBlocks" [attr.data-tone]="block"></i></div></article>
        <article class="workspace-panel escalation-list"><header><strong>Escalations</strong><span>4 open</span></header><p><i data-tone="critical"></i><span><strong>Coverage dispute</strong> CF-2026-0118</span><b>Executive</b></p><p><i data-tone="amber"></i><span><strong>Vendor delay</strong> CF-2026-0125</span><b>Operations</b></p><p><i data-tone="violet"></i><span><strong>Fraud review</strong> CF-2026-0139</span><b>SIU</b></p></article>
        <article class="workspace-panel integrity-strip"><header><strong>Operational integrity</strong><span>Last 24 hours</span></header><strong>99.2%</strong><p>All consequential decisions retain actor, reason, and evidence context.</p><i><b></b></i></article>
      </div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamOperationsPageComponent {
  private readonly data = inject(WorkspaceDataService);
  readonly team = signal('All teams');
  readonly members = this.data.team;
  readonly queues = [{ label: 'Property', score: 82, value: 96 }, { label: 'Auto', score: 64, value: 74 }, { label: 'Liability', score: 55, value: 53 }, { label: 'Complex', score: 38, value: 25 }];
  readonly hours = ['08', '10', '12', '14', '16', '18'];
  readonly shiftBlocks = ['green', 'green', 'cyan', 'cyan', 'amber', 'violet', 'green', 'cyan', 'cyan', 'amber', 'violet', 'violet'];
  setTeam(team: string): void { this.team.set(team); }
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page workflow-workspace page-enter">
      <div class="workflow-toolbar"><div><strong>Property claim triage</strong><span>Draft v8 · Last edited 4 min ago</span></div><button>Versions</button><button>Validate</button><button class="primary" type="button" (click)="runSimulation()">Run simulation</button></div>
      <div class="workflow-layout">
        <aside class="workspace-panel node-library"><header><strong>Components</strong><span>Drag to canvas</span></header><button><i data-tone="cyan"></i><span><strong>Trigger</strong><small>Starts a workflow</small></span></button><button><i data-tone="violet"></i><span><strong>Condition</strong><small>Branches by data</small></span></button><button><i data-tone="magenta"></i><span><strong>AI action</strong><small>Advisory analysis</small></span></button><button><i data-tone="green"></i><span><strong>Action</strong><small>Updates local state</small></span></button><button><i data-tone="amber"></i><span><strong>Approval</strong><small>Human authority</small></span></button><div class="library-note"><strong>Audit safe</strong><p>Approval and state-changing actions retain explicit actor intent.</p></div></aside>
        <section class="workspace-panel workflow-canvas"><header><strong>Workflow canvas</strong><span>5 nodes · 1 branch</span></header><div class="canvas-grid" aria-label="Editable workflow canvas"><article *ngFor="let node of nodes; let index = index" class="workflow-node" [attr.data-tone]="node.tone" [class.selected]="selectedNode() === index" (click)="selectedNode.set(index)"><span>{{ node.kind }}</span><strong>{{ node.title }}</strong><small>{{ node.detail }}</small><i *ngIf="index < nodes.length - 1" aria-hidden="true"></i></article><div class="branch-label">NO → Manual evidence request</div></div></section>
        <aside class="workspace-panel workflow-inspector"><header><strong>Condition inspector</strong><span>Node {{ selectedNode() + 1 }}</span></header><label>Field<select><option>Evidence completeness</option></select></label><label>Operator<select><option>Is below</option></select></label><label>Value<input value="80" /></label><div class="toggle-row"><span><strong>Stop on missing value</strong><small>Prevents uncertain routing.</small></span><i class="toggle active"></i></div><div class="test-result" [attr.data-state]="simulationState()"><span>TEST RESULT</span><strong>{{ simulationState() === 'passed' ? 'Local simulation passed' : 'Ready to simulate' }}</strong><p>{{ simulationState() === 'passed' ? 'The claim followed the evidence review branch. No server changes were made.' : 'Run deterministic test data through this workflow.' }}</p></div><button class="save-button">Save draft locally</button></aside>
      </div>
      <div class="workflow-footer"><article><span>VALIDATION</span><strong>All nodes connected</strong></article><article><span>ESTIMATED IMPACT</span><strong>31% faster triage</strong></article><article><span>HUMAN AUTHORITY</span><strong>Approval preserved</strong></article><article><span>EXECUTION</span><strong>Local simulation only</strong></article></div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowsPageComponent {
  private readonly data = inject(WorkspaceDataService);
  readonly nodes = this.data.workflowNodes;
  readonly selectedNode = signal(1);
  readonly simulationState = signal<'idle' | 'passed'>('idle');
  runSimulation(): void { this.simulationState.set('passed'); }
}

const placeholderTemplate = (eyebrow: string, title: string, description: string, cards: readonly string[]) => `
  <section class="workspace-page placeholder-workspace page-enter">
    <div class="placeholder-hero"><span>${eyebrow}</span><h1>${title}</h1><p>${description}</p><button>Configure workspace →</button></div>
    <div class="placeholder-grid">${cards.map((card, index) => `<article class="workspace-panel"><i>0${index + 1}</i><strong>${card}</strong><p>Structured for the next production integration while preserving the shared shell and accessibility contract.</p></article>`).join('')}</div>
  </section>`;

@Component({ standalone: true, template: placeholderTemplate('PERSONAL OPERATIONS', 'My Work', 'A focused personal command surface for assigned claims, commitments, and upcoming decisions.', ['Priority queue', 'Today’s focus', 'Upcoming approvals', 'Recent activity']), styleUrl: './workspace-pages.component.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class MyWorkPageComponent {}

@Component({ standalone: true, template: placeholderTemplate('REPORTING CENTER', 'Reports', 'Scheduled operational reporting, executive exports, and governed delivery destinations.', ['Report library', 'Scheduled delivery', 'Executive exports', 'Distribution history']), styleUrl: './workspace-pages.component.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class ReportsPageComponent {}

@Component({ standalone: true, template: placeholderTemplate('WORKSPACE GOVERNANCE', 'Settings', 'Configuration for teams, integrations, decision controls, notifications, and data governance.', ['Workspace profile', 'Teams & permissions', 'Integrations', 'Audit policy']), styleUrl: './workspace-pages.component.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class SettingsPageComponent {}
