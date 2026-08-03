import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface WorkloadMatrixRow {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly activeClaims: number;
  readonly capacity: number;
  readonly utilizationPercentage: number;
  readonly atRiskClaims: number;
  readonly overdueClaims: number;
  readonly evidenceReadinessPercentage: number;
}

@Component({
  selector: 'app-workload-matrix',
  standalone: true,
  template: `
    @if (!rows().length) {
      <div class="matrix-empty">No workload matches the current filters.</div>
    } @else {
      <div class="matrix-scroll" role="region" [attr.aria-label]="title()" tabindex="0">
        <table>
          <caption class="sr-only">{{ description() }}</caption>
          <thead><tr><th>Reviewer</th><th>Active / capacity</th><th>Utilization</th><th>Due &lt;24h</th><th>Overdue</th><th>Evidence</th></tr></thead>
          <tbody>
            @for (row of rows(); track row.id) {
              <tr (click)="selected.emit(row)" (keydown.enter)="selected.emit(row)" tabindex="0">
                <th scope="row"><strong>{{ row.label }}</strong><small>{{ row.detail }}</small></th>
                <td class="numeric">{{ row.activeClaims }} / {{ row.capacity }}</td>
                <td>
                  <div class="utilization"><i><b [style.width.%]="bounded(row.utilizationPercentage)"></b><em></em></i><strong>{{ row.utilizationPercentage }}%</strong></div>
                </td>
                <td><span class="risk warning">{{ row.atRiskClaims }}</span></td>
                <td><span class="risk critical">{{ row.overdueClaims }}</span></td>
                <td><span class="evidence" [attr.data-tone]="row.evidenceReadinessPercentage >= 90 ? 'healthy' : row.evidenceReadinessPercentage >= 70 ? 'warning' : 'critical'">{{ row.evidenceReadinessPercentage }}%</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .matrix-scroll { overflow-x: auto; }
    table { width: 100%; min-width: 720px; border-collapse: collapse; }
    th, td { padding: 12px 10px; border-bottom: 1px solid color-mix(in srgb, var(--cf-color-brand-lilac) 10%, transparent); text-align: left; }
    thead th { color: var(--cf-color-text-muted); font-size: 10px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; }
    tbody tr { cursor: pointer; transition: background 140ms var(--cf-ease-standard); }
    tbody tr:hover, tbody tr:focus-visible { background: color-mix(in srgb, var(--cf-color-brand-violet) 7%, transparent); outline: none; }
    tbody th strong { display: block; color: var(--cf-color-text-primary); font-size: 12px; }
    tbody th small { display: block; margin-top: 3px; color: var(--cf-color-text-muted); font-size: 10px; font-weight: 500; }
    .numeric { color: var(--cf-color-text-secondary); font-size: 11px; font-variant-numeric: tabular-nums; }
    .utilization { min-width: 180px; display: grid; grid-template-columns: 1fr 42px; align-items: center; gap: 8px; }
    .utilization i { height: 7px; display: block; position: relative; border-radius: 999px; background: rgb(255 255 255 / .055); }
    .utilization b { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--cf-color-brand-violet), var(--cf-color-brand-lilac)); }
    .utilization em { position: absolute; left: 80%; top: -3px; bottom: -3px; width: 1px; background: var(--cf-color-text-secondary); opacity: .65; }
    .utilization strong { color: var(--cf-color-text-primary); font-size: 11px; font-variant-numeric: tabular-nums; }
    .risk, .evidence { min-width: 34px; min-height: 24px; display: inline-grid; place-items: center; border-radius: 999px; font-size: 10px; font-weight: 750; font-variant-numeric: tabular-nums; }
    .risk.warning { color: var(--cf-color-warning); background: color-mix(in srgb, var(--cf-color-warning) 9%, transparent); }
    .risk.critical { color: var(--cf-color-critical); background: color-mix(in srgb, var(--cf-color-critical) 9%, transparent); }
    .evidence[data-tone='healthy'] { color: var(--cf-color-success); }
    .evidence[data-tone='warning'] { color: var(--cf-color-warning); }
    .evidence[data-tone='critical'] { color: var(--cf-color-critical); }
    .matrix-empty { min-height: 180px; display: grid; place-items: center; color: var(--cf-color-text-muted); font-size: 12px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkloadMatrixComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly rows = input<readonly WorkloadMatrixRow[]>([]);
  readonly selected = output<WorkloadMatrixRow>();

  bounded(value: number): number {
    return Math.max(0, Math.min(100, value));
  }
}
