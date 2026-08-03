import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BarChartDatum, ChartTone } from './chart.models';

@Component({
  selector: 'app-horizontal-bar-chart',
  standalone: true,
  template: `
    @if (!data().length) {
      <div class="bar-empty">No data available for {{ title() }}.</div>
    } @else {
      <div class="bar-chart" role="img" [attr.aria-label]="description()">
        @for (item of data(); track item.label) {
          <button
            type="button"
            class="bar-row"
            [disabled]="!interactive()"
            (click)="selected.emit(item)">
            <span class="bar-label">{{ item.label }}</span>
            <span class="bar-track">
              <i [attr.data-tone]="item.tone || tone()" [style.width.%]="width(item.value)"></i>
              @if (item.secondaryValue !== undefined) {
                <b class="secondary" [style.left.%]="width(item.secondaryValue)"></b>
              }
              @if (item.target !== undefined) {
                <b class="target" [style.left.%]="width(item.target)"></b>
              }
            </span>
            <strong>{{ valueLabel(item) }}</strong>
            @if (item.detail) { <small>{{ item.detail }}</small> }
          </button>
        }
      </div>
      <table class="sr-only" data-chart-summary>
        <caption>{{ title() }} exact values</caption>
        <tbody>@for (item of data(); track item.label) {<tr><th>{{ item.label }}</th><td>{{ item.value }}</td><td>{{ item.detail || '' }}</td></tr>}</tbody>
      </table>
    }
  `,
  styles: [`
    :host { display: block; }
    .bar-chart { display: grid; gap: 11px; }
    .bar-row { width: 100%; display: grid; grid-template-columns: minmax(88px, 1.15fr) minmax(120px, 3fr) auto; align-items: center; gap: 10px; padding: 0; border: 0; color: inherit; background: transparent; text-align: left; cursor: default; }
    .bar-row:not(:disabled) { cursor: pointer; }
    .bar-row:not(:disabled):hover .bar-track { background: rgb(255 255 255 / .075); }
    .bar-label { color: var(--cf-color-text-secondary); font-size: 11px; font-weight: 650; }
    .bar-track { position: relative; height: 8px; overflow: visible; border-radius: 999px; background: rgb(255 255 255 / .05); transition: background 140ms var(--cf-ease-standard); }
    .bar-track i { display: block; height: 100%; border-radius: inherit; background: var(--bar-tone); box-shadow: 0 0 18px color-mix(in srgb, var(--bar-tone) 13%, transparent); transition: width 280ms var(--cf-ease-standard); }
    .bar-track .target { position: absolute; top: -3px; bottom: -3px; width: 1px; background: var(--cf-color-text-primary); opacity: .72; }
    .bar-track .secondary { position: absolute; top: 50%; width: 7px; height: 7px; border: 1px solid var(--cf-color-text-primary); border-radius: 50%; background: var(--cf-color-surface-default); transform: translate(-50%, -50%); }
    .bar-row strong { color: var(--cf-color-text-primary); font-size: 11px; font-variant-numeric: tabular-nums; }
    .bar-row small { grid-column: 2 / -1; margin-top: -7px; color: var(--cf-color-text-muted); font-size: 10px; }
    [data-tone='brand'], [data-tone='secondary'] { --bar-tone: var(--cf-color-brand-lilac); }
    [data-tone='live'] { --bar-tone: var(--cf-color-live); }
    [data-tone='healthy'] { --bar-tone: var(--cf-color-success); }
    [data-tone='warning'] { --bar-tone: var(--cf-color-warning); }
    [data-tone='critical'] { --bar-tone: var(--cf-color-critical); }
    [data-tone='neutral'] { --bar-tone: var(--cf-color-text-muted); }
    .bar-empty { min-height: 160px; display: grid; place-items: center; color: var(--cf-color-text-muted); font-size: 12px; }
    @media (max-width: 600px) { .bar-row { grid-template-columns: 88px minmax(90px, 1fr) auto; } }
    @media (prefers-reduced-motion: reduce) { .bar-track i { transition: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HorizontalBarChartComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly data = input<readonly BarChartDatum[]>([]);
  readonly tone = input<ChartTone>('brand');
  readonly suffix = input('');
  readonly interactive = input(false);
  readonly selected = output<BarChartDatum>();

  readonly maximum = computed(() => Math.max(1, ...this.data().flatMap(item => [item.value, item.secondaryValue ?? 0, item.target ?? 0])));

  width(value: number): number {
    return Math.max(0, Math.min(100, value * 100 / this.maximum()));
  }

  valueLabel(item: BarChartDatum): string {
    return `${item.value}${this.suffix()}`;
  }
}
