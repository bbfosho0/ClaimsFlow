import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MetricTone } from './metric-card.models';

@Component({
  selector: 'app-metric-radial',
  standalone: true,
  template: `
    <div
      class="metric-radial"
      role="img"
      [attr.aria-label]="label() + ': ' + boundedValue() + '%'"
      [style.--metric-progress]="boundedValue() + '%'">
      <span>{{ boundedValue() }}%</span>
    </div>
  `,
  styles: [`
    :host { display: inline-grid; place-items: center; --radial-tone: var(--cf-color-brand-lilac); }
    .metric-radial {
      width: 62px;
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: conic-gradient(var(--radial-tone) var(--metric-progress), rgb(255 255 255 / .06) 0);
      box-shadow: 0 0 24px color-mix(in srgb, var(--radial-tone) 12%, transparent);
      position: relative;
    }
    .metric-radial::after {
      content: '';
      position: absolute;
      inset: 6px;
      border-radius: inherit;
      background: var(--cf-color-surface-default);
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / .035);
    }
    .metric-radial span {
      position: relative;
      z-index: 1;
      color: var(--cf-color-text-primary);
      font-size: 12px;
      font-weight: 750;
      font-variant-numeric: tabular-nums;
    }
    :host[data-tone='live'] { --radial-tone: var(--cf-color-live); }
    :host[data-tone='healthy'] { --radial-tone: var(--cf-color-success); }
    :host[data-tone='warning'] { --radial-tone: var(--cf-color-warning); }
    :host[data-tone='critical'] { --radial-tone: var(--cf-color-critical); }
    :host[data-tone='brand'], :host[data-tone='advisory'] { --radial-tone: var(--cf-color-brand-lilac); }
    :host[data-tone='neutral'] { --radial-tone: var(--cf-color-text-muted); }
  `],
  host: { '[attr.data-tone]': 'tone()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricRadialComponent {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly tone = input<MetricTone>('brand');
  readonly boundedValue = computed(() => Math.max(0, Math.min(100, Math.round(this.value()))));
}
