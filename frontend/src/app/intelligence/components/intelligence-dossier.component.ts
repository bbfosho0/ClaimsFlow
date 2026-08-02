import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { humanizeEnum } from '../../shared/presentation/claim-presentation';
import { EvidenceReasoningGraphComponent } from '../evidence-reasoning-graph.component';
import { EvidenceReasoningNode, IntelligenceQueueItem, IntelligenceWorkspace } from '../intelligence.models';

@Component({
  selector: 'app-intelligence-dossier',
  standalone: true,
  imports: [CommonModule, EvidenceReasoningGraphComponent],
  templateUrl: './intelligence-dossier.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntelligenceDossierComponent {
  readonly selectedItem = input<IntelligenceQueueItem | null>(null);
  readonly workspace = input.required<IntelligenceWorkspace>();
  readonly reasoningNodes = input.required<readonly EvidenceReasoningNode[]>();
  readonly acting = input(false);
  readonly generateRecommendation = output<void>();
  readonly prepareApproval = output<void>();
  readonly prepareRejection = output<void>();
  readonly label = humanizeEnum;
}
