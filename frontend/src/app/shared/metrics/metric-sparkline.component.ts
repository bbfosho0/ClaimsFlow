import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { linePoints } from '../visualizations/chart-scale';
import { MetricSparkPoint, MetricTone } from './metric-card.models';

@Component({
  selector: 'app-metric-sparkline',
  standalone: true,
  template: `
    @if (points().length) {
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img">
        <title>{{ label() }}</title>
        <desc>{{ description() }}</desc>
        <defs>
          <linearGradient [id]="gradientId()" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="currentColor" stop-opacity=".24" />
            <stop offset="1" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
        </defs>
        <polygon [attr.points]="areaPoints()" [attr.fill]="'url(#' + gradientId() + ')'" />
        <polyline [attr.points]="polyline()" />
      </svg>
    }
  `,
  styles: [`
    :host { display: block; color: var(--spark-tone); }
    svg { width: 100%; height: 48px; display: block; overflow: visible; }
    polyline { fill: none; stroke: currentColor; stroke-width: 2; vector-effect: non-scaling-stroke; stroke-linecap: round; stroke-linejoin: round; }
    :host[data-tone='brand'] { --spark-tone: var(--cf-color-brand-lilac); }
    :host[data-tone='live'] { --spark-tone: var(--cf-color-live); }
    :host[data-tone='healthy'] { --spark-tone: var(--cf-color-success); }
    :host[data-tone='warning'] { --spark-tone: var(--cf-color-warning); }
    :host[data-tone='critical'] { --spark-tone: var(--cf-color-critical); }
    :host[data-tone='advisory'] { --spark-tone: var(--cf-color-intelligence); }
    :host[data-tone='neutral'] { --spark-tone: var(--cf-color-text-muted); }
  `],
  host: { '[attr.data-tone]': 'tone()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricSparklineComponent {
  readonly points = input<readonly MetricSparkPoint[]>([]);
  readonly label = input.required<string>();
  readonly tone = input<MetricTone>('brand');

  readonly polyline = computed(() => linePoints(
    this.points().map(point => ({ x: point.label, y: point.value })),
    100,
    40,
    3,
  ));
  readonly areaPoints = computed(() => this.polyline() ? `3,39 ${this.polyline()} 97,39` : '');
  readonly description = computed(() => this.points().map(point => `${point.label}: ${point.value}`).join('; '));
  readonly gradientId = computed(() => `metric-spark-${this.label().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
}
