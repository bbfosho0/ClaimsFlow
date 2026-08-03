import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { HeatmapCell, HeatmapRow } from './chart.models';

@Component({
  selector: 'app-heatmap-table',
  standalone: true,
  template: `
    @if (!rows().length) {
      <div class="heatmap-empty">No data available for {{ title() }}.</div>
    } @else {
      <div class="heatmap-scroll" role="region" [attr.aria-label]="title()" tabindex="0">
        <table class="heatmap-table">
          <caption class="sr-only">{{ description() }}</caption>
          <thead><tr><th scope="col">{{ rowHeader() }}</th>@for (header of headers(); track header) {<th scope="col">{{ header }}</th>}</tr></thead>
          <tbody>
            @for (row of rows(); track row.key) {
              <tr>
                <th scope="row">{{ row.label }}</th>
                @for (cell of row.cells; track cell.key) {
                  <td>
                    <button
                      type="button"
                      [disabled]="cell.value === null"
                      [style.--heat]="intensity(cell.value)"
                      [attr.data-tone]="cell.tone || 'brand'"
                      [attr.aria-label]="cellAria(row, cell)"
                      (click)="selected.emit({ row, cell })">
                      {{ cell.value === null ? '—' : cell.value + suffix() }}
                    </button>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .heatmap-scroll { max-width: 100%; overflow-x: auto; }
    .heatmap-table { width: 100%; min-width: 580px; border-collapse: separate; border-spacing: 5px; }
    th { padding: 7px 9px; color: var(--cf-color-text-muted); font-size: 10px; font-weight: 700; letter-spacing: .06em; text-align: left; }
    td { padding: 0; }
    td button { width: 100%; min-height: 42px; border: 1px solid color-mix(in srgb, var(--heat-tone) calc(var(--heat) * 26%), var(--cf-color-border-hairline)); border-radius: 9px; color: var(--cf-color-text-primary); background: color-mix(in srgb, var(--heat-tone) calc(5% + var(--heat) * 22%), var(--cf-color-surface-elevated)); font-size: 11px; font-weight: 720; font-variant-numeric: tabular-nums; cursor: pointer; }
    td button:hover:not(:disabled), td button:focus-visible:not(:disabled) { border-color: color-mix(in srgb, var(--heat-tone) 52%, var(--cf-color-border-strong)); filter: brightness(1.1); }
    td button:disabled { color: var(--cf-color-text-dim); cursor: default; opacity: .62; }
    [data-tone='brand'] { --heat-tone: var(--cf-color-brand-violet); }
    [data-tone='secondary'] { --heat-tone: var(--cf-color-brand-lilac); }
    [data-tone='live'] { --heat-tone: var(--cf-color-live); }
    [data-tone='healthy'] { --heat-tone: var(--cf-color-success); }
    [data-tone='warning'] { --heat-tone: var(--cf-color-warning); }
    [data-tone='critical'] { --heat-tone: var(--cf-color-critical); }
    [data-tone='neutral'] { --heat-tone: var(--cf-color-text-muted); }
    .heatmap-empty { min-height: 180px; display: grid; place-items: center; color: var(--cf-color-text-muted); font-size: 12px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatmapTableComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly rowHeader = input('Cohort');
  readonly headers = input<readonly string[]>([]);
  readonly rows = input<readonly HeatmapRow[]>([]);
  readonly suffix = input('%');
  readonly selected = output<{ row: HeatmapRow; cell: HeatmapCell }>();

  intensity(value: number | null): number {
    return value === null ? 0 : Math.max(0, Math.min(1, value / 100));
  }

  cellAria(row: HeatmapRow, cell: HeatmapCell): string {
    const value = cell.value === null ? 'No data' : `${cell.value}${this.suffix()}`;
    return `${row.label}, ${cell.label}: ${value}${cell.detail ? `. ${cell.detail}` : ''}`;
  }
}
