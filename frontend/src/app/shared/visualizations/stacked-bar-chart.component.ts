import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { StackedChartSegment } from './chart.models';

@Component({
  selector: 'app-stacked-bar-chart',
  standalone: true,
  template: `
    @if (!total()) {
      <div class="stacked-empty">No data available for {{ title() }}.</div>
    } @else {
      <div class="stacked-chart" role="img" [attr.aria-label]="description()">
        <div class="stacked-track">
          @for (segment of segments(); track segment.key) {
            <button
              type="button"
              [attr.data-tone]="segment.tone"
              [style.width.%]="percentage(segment.value)"
              [attr.aria-label]="segment.label + ': ' + segment.value + ', ' + percentage(segment.value) + '% of total'"
              (click)="selected.emit(segment)">
              @if (percentage(segment.value) >= 12) { <span>{{ percentage(segment.value) }}%</span> }
            </button>
          }
        </div>
        <div class="stacked-legend">
          @for (segment of segments(); track segment.key) {
            <button type="button" (click)="selected.emit(segment)" [attr.data-tone]="segment.tone"><i></i><span>{{ segment.label }}</span><strong>{{ segment.value }}</strong></button>
          }
        </div>
      </div>
      <table class="sr-only" data-chart-summary><caption>{{ title() }} exact values</caption><tbody>@for (segment of segments(); track segment.key) {<tr><th>{{ segment.label }}</th><td>{{ segment.value }}</td><td>{{ percentage(segment.value) }}%</td></tr>}</tbody></table>
    }
  `,
  styles: [`
    :host { display: block; }
    .stacked-track { height: 18px; display: flex; overflow: hidden; border-radius: 999px; background: rgb(255 255 255 / .05); }
    .stacked-track button { min-width: 2px; display: grid; place-items: center; border: 0; padding: 0; color: #09060e; background: var(--stack-tone); font-size: 9px; font-weight: 800; cursor: pointer; transition: width 280ms var(--cf-ease-standard), filter 140ms var(--cf-ease-standard); }
    .stacked-track button:hover, .stacked-track button:focus-visible { filter: brightness(1.15); }
    .stacked-legend { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 12px; }
    .stacked-legend button { display: inline-flex; align-items: center; gap: 6px; border: 0; padding: 0; color: var(--cf-color-text-secondary); background: transparent; font-size: 10px; cursor: pointer; }
    .stacked-legend i { width: 7px; height: 7px; border-radius: 50%; background: var(--stack-tone); }
    .stacked-legend strong { color: var(--cf-color-text-primary); font-variant-numeric: tabular-nums; }
    [data-tone='brand'], [data-tone='secondary'] { --stack-tone: var(--cf-color-brand-lilac); }
    [data-tone='live'] { --stack-tone: var(--cf-color-live); }
    [data-tone='healthy'] { --stack-tone: var(--cf-color-success); }
    [data-tone='warning'] { --stack-tone: var(--cf-color-warning); }
    [data-tone='critical'] { --stack-tone: var(--cf-color-critical); }
    [data-tone='neutral'] { --stack-tone: var(--cf-color-text-muted); }
    .stacked-empty { min-height: 100px; display: grid; place-items: center; color: var(--cf-color-text-muted); font-size: 12px; }
    @media (prefers-reduced-motion: reduce) { .stacked-track button { transition: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackedBarChartComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly segments = input<readonly StackedChartSegment[]>([]);
  readonly selected = output<StackedChartSegment>();
  readonly total = computed(() => this.segments().reduce((sum, segment) => sum + Math.max(0, segment.value), 0));

  percentage(value: number): number {
    return this.total() ? Math.round(Math.max(0, value) * 100 / this.total()) : 0;
  }
}
