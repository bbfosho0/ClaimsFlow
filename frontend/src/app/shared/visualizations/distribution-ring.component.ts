import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { StackedChartSegment } from './chart.models';

@Component({
  selector: 'app-distribution-ring',
  standalone: true,
  template: `
    @if (!total()) {
      <div class="ring-empty">No data available for {{ title() }}.</div>
    } @else {
      <div class="ring-layout">
        <div class="distribution-ring" role="img" [attr.aria-label]="description()" [style.background]="gradient()">
          <div><strong>{{ centerValue() }}</strong><span>{{ centerLabel() }}</span></div>
        </div>
        <div class="ring-legend">
          @for (segment of segments(); track segment.key) {
            <button type="button" [attr.data-tone]="segment.tone" (click)="selected.emit(segment)">
              <i></i><span>{{ segment.label }}</span><strong>{{ segment.value }} · {{ percentage(segment.value) }}%</strong>
            </button>
          }
        </div>
      </div>
      <table class="sr-only" data-chart-summary><caption>{{ title() }} exact values</caption><tbody>@for (segment of segments(); track segment.key) {<tr><th>{{ segment.label }}</th><td>{{ segment.value }}</td><td>{{ percentage(segment.value) }}%</td></tr>}</tbody></table>
    }
  `,
  styles: [`
    :host { display: block; }
    .ring-layout { display: grid; grid-template-columns: minmax(130px, .8fr) minmax(160px, 1.2fr); align-items: center; gap: 22px; }
    .distribution-ring { width: min(100%, 170px); aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%; position: relative; box-shadow: 0 0 38px rgb(139 92 246 / .08); }
    .distribution-ring::after { content: ''; position: absolute; inset: 17px; border-radius: inherit; background: var(--cf-color-surface-default); box-shadow: inset 0 0 0 1px rgb(255 255 255 / .04); }
    .distribution-ring > div { position: relative; z-index: 1; display: grid; text-align: center; }
    .distribution-ring strong { color: var(--cf-color-text-primary); font-size: 25px; line-height: 1; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
    .distribution-ring span { margin-top: 5px; color: var(--cf-color-text-muted); font-size: 10px; text-transform: uppercase; letter-spacing: .1em; }
    .ring-legend { display: grid; gap: 9px; }
    .ring-legend button { display: grid; grid-template-columns: 8px 1fr auto; align-items: center; gap: 8px; border: 0; padding: 0; color: var(--cf-color-text-secondary); background: transparent; font-size: 11px; text-align: left; cursor: pointer; }
    .ring-legend i { width: 8px; height: 8px; border-radius: 50%; background: var(--ring-tone); }
    .ring-legend strong { color: var(--cf-color-text-primary); font-variant-numeric: tabular-nums; }
    [data-tone='brand'] { --ring-tone: var(--cf-color-brand-violet); }
    [data-tone='secondary'] { --ring-tone: var(--cf-color-brand-lilac); }
    [data-tone='live'] { --ring-tone: var(--cf-color-live); }
    [data-tone='healthy'] { --ring-tone: var(--cf-color-success); }
    [data-tone='warning'] { --ring-tone: var(--cf-color-warning); }
    [data-tone='critical'] { --ring-tone: var(--cf-color-critical); }
    [data-tone='neutral'] { --ring-tone: var(--cf-color-text-muted); }
    .ring-empty { min-height: 180px; display: grid; place-items: center; color: var(--cf-color-text-muted); font-size: 12px; }
    @media (max-width: 560px) { .ring-layout { grid-template-columns: 1fr; justify-items: center; } .ring-legend { width: 100%; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributionRingComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly segments = input<readonly StackedChartSegment[]>([]);
  readonly centerValue = input<string | number>('');
  readonly centerLabel = input('Total');
  readonly selected = output<StackedChartSegment>();
  readonly total = computed(() => this.segments().reduce((sum, segment) => sum + Math.max(0, segment.value), 0));
  readonly gradient = computed(() => {
    if (!this.total()) return 'rgb(255 255 255 / .05)';
    let cursor = 0;
    const stops = this.segments().map(segment => {
      const start = cursor;
      cursor += Math.max(0, segment.value) * 100 / this.total();
      return `${this.color(segment.tone)} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  });

  percentage(value: number): number {
    return this.total() ? Math.round(Math.max(0, value) * 100 / this.total()) : 0;
  }

  private color(tone: StackedChartSegment['tone']): string {
    return ({
      brand: 'var(--cf-color-brand-violet)',
      secondary: 'var(--cf-color-brand-lilac)',
      live: 'var(--cf-color-live)',
      healthy: 'var(--cf-color-success)',
      warning: 'var(--cf-color-warning)',
      critical: 'var(--cf-color-critical)',
      neutral: 'var(--cf-color-text-muted)',
    })[tone];
  }
}
