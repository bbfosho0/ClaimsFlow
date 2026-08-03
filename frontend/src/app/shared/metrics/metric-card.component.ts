import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AnimatedNumberComponent, AnimatedNumberFormat } from '../operational/animated-number.component';
import { MetricCardVariant, MetricDeltaChange, MetricTone } from './metric-card.models';
import { MetricDeltaComponent } from './metric-delta.component';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [AnimatedNumberComponent, MetricDeltaComponent],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  readonly label = input.required<string>();
  readonly value = input<number | string>(0);
  readonly format = input<AnimatedNumberFormat>('integer');
  readonly currency = input('USD');
  readonly variant = input<MetricCardVariant>('compact');
  readonly tone = input<MetricTone>('neutral');
  readonly helper = input('');
  readonly definition = input('');
  readonly delta = input<MetricDeltaChange | null>(null);
  readonly inverseDelta = input(false);
  readonly currentPeriod = input('Current period');
  readonly previousPeriod = input('Prior period');
  readonly currentValue = input('');
  readonly previousValue = input('');
  readonly loading = input(false);
  readonly stale = input(false);
  readonly staleMessage = input('Showing the last successful update.');
  readonly noData = input(false);
  readonly noDataLabel = input('No data available.');
  readonly valueAriaLabel = input('');

  isNumeric(value: number | string): value is number {
    return typeof value === 'number';
  }

  numericValue(): number {
    const current = this.value();
    return typeof current === 'number' ? current : 0;
  }
}
