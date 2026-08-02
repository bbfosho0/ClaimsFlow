import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EvidenceReasoningNode } from './intelligence.models';

@Component({
  selector: 'app-evidence-reasoning-graph',
  standalone: true,
  templateUrl: './evidence-reasoning-graph.component.html',
  styleUrl: './evidence-reasoning-graph.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvidenceReasoningGraphComponent {
  readonly nodes = input.required<readonly EvidenceReasoningNode[]>();
  readonly recommendationLabel = input('Recommendation');

  nodeY(index: number, count: number): number {
    if (count <= 1) return 170;
    return 55 + index * (230 / (count - 1));
  }

  classificationLabel(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
