import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ReducedMotionService } from '../operational/reduced-motion.service';
import { ChartDatum, LineChartSeries } from './chart.models';
import { linePoints, pointX, pointY } from './chart-scale';

@Component({
  selector: 'app-line-area-chart',
  standalone: true,
  template: `
    <div class="line-area-chart" [attr.data-reduced-motion]="reducedMotion.reduced()">
      @if (!hasData()) {
        <div class="chart-empty">No data available for {{ title() }}.</div>
      } @else {
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
          <title>{{ title() }}</title>
          <desc>{{ description() }}</desc>
          <g class="chart-grid" aria-hidden="true">
            <line x1="6" y1="24" x2="94" y2="24" />
            <line x1="6" y1="50" x2="94" y2="50" />
            <line x1="6" y1="76" x2="94" y2="76" />
          </g>
          @for (item of series(); track item.key) {
            @if (item.area) {
              <polygon
                class="chart-area"
                [attr.data-tone]="item.tone"
                [attr.points]="areaPoints(item)" />
            }
            <polyline
              class="chart-line"
              [class.dashed]="item.dashed"
              [attr.data-tone]="item.tone"
              [attr.points]="seriesPoints(item)" />
            @for (point of item.points; track point.label; let index = $index) {
              <circle
                class="chart-point"
                [attr.data-tone]="item.tone"
                [attr.cx]="x(index, item.points.length)"
                [attr.cy]="y(point, item.points)"
                r="1.8"
                tabindex="0"
                [attr.aria-label]="item.label + ', ' + point.label + ': ' + point.value">
                <title>{{ item.label }}, {{ point.label }}: {{ point.value }}</title>
              </circle>
            }
          }
        </svg>

        <div class="chart-legend" aria-hidden="true">
          @for (item of series(); track item.key) {
            <span [attr.data-tone]="item.tone"><i></i>{{ item.label }}</span>
          }
        </div>

        <table class="sr-only" data-chart-summary>
          <caption>{{ title() }} exact values</caption>
          <thead><tr><th>Period</th>@for (item of series(); track item.key) {<th>{{ item.label }}</th>}</tr></thead>
          <tbody>
            @for (label of labels(); track label) {
              <tr><th>{{ label }}</th>@for (item of series(); track item.key) {<td>{{ valueAt(item, label) ?? 'No data' }}</td>}</tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .line-area-chart { min-width: 0; }
    svg { width: 100%; height: 230px; display: block; overflow: visible; }
    .chart-grid line { stroke: color-mix(in srgb, var(--cf-color-brand-lilac) 12%, transparent); stroke-width: .35; }
    .chart-line { fill: none; stroke: var(--chart-tone); stroke-width: 2.25; vector-effect: non-scaling-stroke; stroke-linecap: round; stroke-linejoin: round; transition: d 280ms var(--cf-ease-standard), opacity 280ms var(--cf-ease-standard); }
    .chart-line.dashed { stroke-dasharray: 4 4; opacity: .72; }
    .chart-area { fill: var(--chart-tone); opacity: .12; }
    .chart-point { fill: var(--cf-color-surface-default); stroke: var(--chart-tone); stroke-width: 1.2; vector-effect: non-scaling-stroke; opacity: 0; transition: opacity 140ms var(--cf-ease-standard), r 140ms var(--cf-ease-standard); }
    .chart-point:hover, .chart-point:focus { opacity: 1; r: 2.5; outline: none; }
    [data-tone='brand'] { --chart-tone: var(--cf-color-brand-violet); }
    [data-tone='secondary'] { --chart-tone: var(--cf-color-brand-lilac); }
    [data-tone='live'] { --chart-tone: var(--cf-color-live); }
    [data-tone='healthy'] { --chart-tone: var(--cf-color-success); }
    [data-tone='warning'] { --chart-tone: var(--cf-color-warning); }
    [data-tone='critical'] { --chart-tone: var(--cf-color-critical); }
    [data-tone='neutral'] { --chart-tone: var(--cf-color-text-muted); }
    .chart-legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; color: var(--cf-color-text-secondary); font-size: 11px; }
    .chart-legend span { display: inline-flex; align-items: center; gap: 6px; }
    .chart-legend i { width: 16px; height: 2px; border-radius: 999px; background: var(--chart-tone); }
    .chart-empty { min-height: 230px; display: grid; place-items: center; color: var(--cf-color-text-muted); font-size: 12px; }
    @media (max-width: 760px) { svg { height: 190px; } }
    @media (prefers-reduced-motion: reduce) { .chart-line, .chart-point { transition: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineAreaChartComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly series = input<readonly LineChartSeries[]>([]);
  readonly reducedMotion = inject(ReducedMotionService);

  readonly hasData = computed(() => this.series().some(item => item.points.length > 0));
  readonly labels = computed(() => this.series().find(item => item.points.length)?.points.map(point => point.label) ?? []);

  seriesPoints(series: LineChartSeries): string {
    return linePoints(series.points.map(point => ({ x: point.label, y: point.value })));
  }

  areaPoints(series: LineChartSeries): string {
    const points = this.seriesPoints(series);
    if (!points) return '';
    return `6.00,94.00 ${points} 94.00,94.00`;
  }

  x(index: number, total: number): number {
    return pointX(index, total);
  }

  y(point: ChartDatum, points: readonly ChartDatum[]): number {
    return pointY(point.value, points.map(value => value.value));
  }

  valueAt(series: LineChartSeries, label: string): number | null {
    return series.points.find(point => point.label === label)?.value ?? null;
  }
}
