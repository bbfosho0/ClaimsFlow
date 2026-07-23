import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly context = input.required<string>();
  readonly tone = input<'primary' | 'neutral' | 'warning' | 'critical'>('neutral');
  readonly icon = input.required<string>();
}
