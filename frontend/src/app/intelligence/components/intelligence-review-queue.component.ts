import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { humanizeEnum } from '../../shared/presentation/claim-presentation';
import { IntelligenceQueueItem } from '../intelligence.models';

@Component({
  selector: 'app-intelligence-review-queue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intelligence-review-queue.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntelligenceReviewQueueComponent {
  readonly items = input.required<readonly IntelligenceQueueItem[]>();
  readonly selectedId = input('');
  readonly loading = input(false);
  readonly selected = output<IntelligenceQueueItem>();
  readonly label = humanizeEnum;
}
