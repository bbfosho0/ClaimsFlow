import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { humanizeEnum } from '../../shared/presentation/claim-presentation';
import { AssistantAnswer, IntelligenceMode, IntelligenceWorkspace } from '../intelligence.models';

@Component({
  selector: 'app-claim-assistant-panel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './claim-assistant-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimAssistantPanelComponent {
  readonly workspace = input.required<IntelligenceWorkspace>();
  readonly mode = input.required<IntelligenceMode>();
  readonly answer = input.required<AssistantAnswer>();
  readonly preparedDraft = input('');
  readonly modeChanged = output<IntelligenceMode>();
  readonly prepareEvidenceRequest = output<void>();
  readonly prepareApproval = output<void>();
  readonly label = humanizeEnum;
}
