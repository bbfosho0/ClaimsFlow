import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ReasoningNodeKind = 'evidence' | 'rule' | 'recommendation' | 'uncertainty';

export interface ReasoningFlowNode {
  readonly id: string;
  readonly kind: ReasoningNodeKind;
  readonly label: string;
  readonly detail: string;
  readonly tone: 'brand' | 'live' | 'healthy' | 'warning' | 'critical' | 'neutral';
}

export interface ReasoningFlowEdge {
  readonly from: string;
  readonly to: string;
  readonly label?: string;
}

@Component({
  selector: 'app-reasoning-flow',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!nodes().length) {
      <div class="reasoning-empty">No reasoning evidence is available.</div>
    } @else {
      <div class="reasoning-flow" role="group" [attr.aria-label]="description()">
        <section>
          <header><span>01</span><strong>Evidence inputs</strong></header>
          @for (node of byKind('evidence'); track node.id) { <ng-container *ngTemplateOutlet="nodeTemplate; context: { $implicit: node }" /> }
          @for (node of byKind('uncertainty'); track node.id) { <ng-container *ngTemplateOutlet="nodeTemplate; context: { $implicit: node }" /> }
        </section>
        <i aria-hidden="true">→</i>
        <section>
          <header><span>02</span><strong>Rules and constraints</strong></header>
          @for (node of byKind('rule'); track node.id) { <ng-container *ngTemplateOutlet="nodeTemplate; context: { $implicit: node }" /> }
        </section>
        <i aria-hidden="true">→</i>
        <section>
          <header><span>03</span><strong>Recommendation</strong></header>
          @for (node of byKind('recommendation'); track node.id) { <ng-container *ngTemplateOutlet="nodeTemplate; context: { $implicit: node }" /> }
        </section>
      </div>
      <ng-template #nodeTemplate let-node>
        <button type="button" class="reasoning-node" [attr.data-kind]="node.kind" [attr.data-tone]="node.tone" (click)="selected.emit(node)">
          <span>{{ node.label }}</span><small>{{ node.detail }}</small>
        </button>
      </ng-template>
      <ol class="sr-only" data-chart-summary><li *ngFor="let edge of edges()">{{ edge.from }} to {{ edge.to }}{{ edge.label ? ': ' + edge.label : '' }}</li></ol>
    }
  `,
  styles: [`
    :host { display: block; }
    .reasoning-flow { display: grid; grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr) 28px minmax(0, 1fr); align-items: center; gap: 8px; }
    .reasoning-flow > i { color: var(--cf-color-brand-lilac); font-style: normal; text-align: center; opacity: .75; }
    section { min-width: 0; display: grid; align-content: start; gap: 9px; padding: 12px; border: 1px solid color-mix(in srgb, var(--cf-color-brand-lilac) 12%, transparent); border-radius: 14px; background: rgb(255 255 255 / .018); }
    section header { display: flex; align-items: center; gap: 7px; margin-bottom: 2px; }
    section header span { color: var(--cf-color-brand-lilac); font-size: 9px; font-weight: 800; letter-spacing: .1em; }
    section header strong { color: var(--cf-color-text-secondary); font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
    .reasoning-node { width: 100%; display: grid; gap: 4px; border: 1px solid color-mix(in srgb, var(--node-tone) 22%, var(--cf-color-border-hairline)); border-radius: 10px; padding: 10px; color: var(--cf-color-text-primary); background: color-mix(in srgb, var(--node-tone) 6%, var(--cf-color-surface-elevated)); text-align: left; cursor: pointer; transition: transform 140ms var(--cf-ease-standard), border-color 140ms var(--cf-ease-standard); }
    .reasoning-node:hover, .reasoning-node:focus-visible { transform: translateY(-1px); border-color: color-mix(in srgb, var(--node-tone) 44%, var(--cf-color-border-strong)); }
    .reasoning-node > span { font-size: 11px; font-weight: 700; }
    .reasoning-node small { color: var(--cf-color-text-muted); font-size: 10px; line-height: 1.45; }
    .reasoning-node[data-kind='uncertainty'] { border-style: dashed; }
    [data-tone='brand'] { --node-tone: var(--cf-color-brand-violet); }
    [data-tone='live'] { --node-tone: var(--cf-color-live); }
    [data-tone='healthy'] { --node-tone: var(--cf-color-success); }
    [data-tone='warning'] { --node-tone: var(--cf-color-warning); }
    [data-tone='critical'] { --node-tone: var(--cf-color-critical); }
    [data-tone='neutral'] { --node-tone: var(--cf-color-text-muted); }
    .reasoning-empty { min-height: 160px; display: grid; place-items: center; color: var(--cf-color-text-muted); font-size: 12px; }
    @media (max-width: 820px) { .reasoning-flow { grid-template-columns: 1fr; } .reasoning-flow > i { transform: rotate(90deg); } }
    @media (prefers-reduced-motion: reduce) { .reasoning-node { transition: none; } .reasoning-node:hover { transform: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReasoningFlowComponent {
  readonly description = input.required<string>();
  readonly nodes = input<readonly ReasoningFlowNode[]>([]);
  readonly edges = input<readonly ReasoningFlowEdge[]>([]);
  readonly selected = output<ReasoningFlowNode>();

  byKind(kind: ReasoningNodeKind): readonly ReasoningFlowNode[] {
    return this.nodes().filter(node => node.kind === kind);
  }
}
