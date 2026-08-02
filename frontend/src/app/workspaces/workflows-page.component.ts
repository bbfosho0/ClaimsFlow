import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { WorkspaceDataService } from './workspace-data.service';

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

  runSimulation(): void {
    this.simulationState.set('passed');
  }
}
