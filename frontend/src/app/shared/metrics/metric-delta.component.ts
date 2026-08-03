import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MetricDeltaChange } from './metric-card.models';

@Component({
  selector: 'app-metric-delta',
  standalone: true,
  template: `
    <span
      class="metric-delta"
      [attr.data-tone]="tone()"
      [attr.aria-label]="ariaLabel()">
      <span aria-hidden="true">{{ icon() }}</span>
      {{ label() }}
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .metric-delta {
      min-height: 25px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 8px;
      border: 1px solid var(--cf-color-border-subtle);
      border-radius: var(--cf-radius-pill);
      color: var(--cf-color-text-secondary);
      background: rgb(255 255 255 / .025);
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .metric-delta[data-tone='positive'] {
      color: var(--cf-color-success);
      border-color: color-mix(in srgb, var(--cf-color-success) 30%, transparent);
      background: color-mix(in srgb, var(--cf-color-success) 8%, transparent);
    }
    .metric-delta[data-tone='negative'] {
      color: var(--cf-color-critical);
      border-color: color-mix(in srgb, var(--cf-color-critical) 30%, transparent);
      background: color-mix(in srgb, var(--cf-color-critical) 8%, transparent);
    }
    .metric-delta[data-tone='new'] {
      color: var(--cf-color-live);
      border-color: color-mix(in srgb, var(--cf-color-live) 28%, transparent);
      background: color-mix(in srgb, var(--cf-color-live) 7%, transparent);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricDeltaComponent {
  readonly change = input.required<MetricDeltaChange>();
  readonly inverse = input(false);
  readonly currentPeriod = input('Current period');
  readonly previousPeriod = input('Prior period');
  readonly currentValue = input('');
  readonly previousValue = input('');

  readonly label = computed(() => {
    const change = this.change();
    switch (change.kind) {
      case 'NEW': return 'New vs prior period';
      case 'CLEARED': return 'Cleared vs prior period';
      case 'UNCHANGED': return 'No change';
      case 'PERCENTAGE': {
        const percentage = change.percentage ?? 0;
        const prefix = percentage > 0 ? '+' : '';
        return `${prefix}${percentage.toFixed(1).replace('.0', '')}% vs prior period`;
      }
    }
  });

  readonly tone = computed<'positive' | 'negative' | 'neutral' | 'new'>(() => {
    const change = this.change();
    if (change.kind === 'NEW') return 'new';
    if (change.kind === 'CLEARED') return this.inverse() ? 'positive' : 'negative';
    if (change.kind !== 'PERCENTAGE' || !change.percentage) return 'neutral';
    const operationallyPositive = this.inverse()
      ? change.percentage < 0
      : change.percentage > 0;
    return operationallyPositive ? 'positive' : 'negative';
  });

  readonly icon = computed(() => {
    const change = this.change();
    if (change.kind === 'NEW') return '◆';
    if (change.kind === 'CLEARED') return '✓';
    if (change.kind === 'UNCHANGED' || !change.percentage) return '—';
    return change.percentage > 0 ? '↗' : '↘';
  });

  readonly ariaLabel = computed(() => {
    const values = this.currentValue() || this.previousValue()
      ? ` ${this.currentPeriod()}: ${this.currentValue() || 'not available'}; ${this.previousPeriod()}: ${this.previousValue() || 'not available'}.`
      : '';
    return `${this.label()}.${values}`.trim();
  });
}
