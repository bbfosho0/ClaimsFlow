import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SemanticTone } from '../../presentation/claim-presentation';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<SemanticTone>('neutral');
  readonly icon = input<string>('•');
}
