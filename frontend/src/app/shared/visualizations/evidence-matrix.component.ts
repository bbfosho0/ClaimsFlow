import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface EvidenceMatrixCell {
  readonly key: string;
  readonly label: string;
  readonly present: boolean;
}

export interface EvidenceMatrixRow {
  readonly claimId: string;
  readonly claimNumber: string;
  readonly claimantName: string;
  readonly priority: string;
  readonly slaLabel: string;
  readonly slaTone: 'healthy' | 'live' | 'warning' | 'critical' | 'neutral';
  readonly completenessPercentage: number;
  readonly cells: readonly EvidenceMatrixCell[];
}

@Component({
  selector: 'app-evidence-matrix',
  standalone: true,
  template: `
    @if (!rows().length) {
      <div class="evidence-empty">No evidence records match the current filters.</div>
    } @else {
      <div class="evidence-scroll" role="region" [attr.aria-label]="title()" tabindex="0">
        <table>
          <caption class="sr-only">{{ description() }}</caption>
          <thead><tr><th>Claim</th>@for (header of headers(); track header.key) {<th>{{ header.label }}</th>}<th>Complete</th></tr></thead>
          <tbody>
            @for (row of rows(); track row.claimId) {
              <tr tabindex="0" (click)="selected.emit(row)" (keydown.enter)="selected.emit(row)">
                <th scope="row">
                  <strong>{{ row.claimNumber }}</strong>
                  <span>{{ row.claimantName }}</span>
                  <small>{{ row.priority }} · <b [attr.data-tone]="row.slaTone">{{ row.slaLabel }}</b></small>
                </th>
                @for (header of headers(); track header.key) {
                  @if (cell(row, header.key); as item) {
                    <td>
                      <span class="evidence-state" [attr.data-present]="item.present" [attr.aria-label]="item.label + ': ' + (item.present ? 'Present' : 'Missing')">
                        <i aria-hidden="true">{{ item.present ? '✓' : '!' }}</i>
                        <small>{{ item.present ? 'Present' : 'Missing' }}</small>
                      </span>
                    </td>
                  } @else {
                    <td><span class="evidence-state unavailable" aria-label="Not represented">—</span></td>
                  }
                }
                <td><strong class="completion" [attr.data-tone]="row.completenessPercentage === 100 ? 'healthy' : row.completenessPercentage >= 75 ? 'warning' : 'critical'">{{ row.completenessPercentage }}%</strong></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .evidence-scroll { overflow-x: auto; }
    table { width: 100%; min-width: 820px; border-collapse: separate; border-spacing: 0; }
    th, td { padding: 11px 10px; border-bottom: 1px solid color-mix(in srgb, var(--cf-color-brand-lilac) 10%, transparent); text-align: center; }
    thead th { position: sticky; top: 0; z-index: 1; color: var(--cf-color-text-muted); background: var(--cf-color-surface-default); font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
    thead th:first-child, tbody th { text-align: left; }
    tbody tr { cursor: pointer; transition: background 140ms var(--cf-ease-standard); }
    tbody tr:hover, tbody tr:focus-visible { background: color-mix(in srgb, var(--cf-color-brand-violet) 7%, transparent); outline: none; }
    tbody th strong { display: block; color: var(--cf-color-text-primary); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; }
    tbody th > span { display: block; margin-top: 3px; color: var(--cf-color-text-secondary); font-size: 11px; font-weight: 600; }
    tbody th small { display: block; margin-top: 3px; color: var(--cf-color-text-muted); font-size: 10px; font-weight: 500; }
    tbody th small b[data-tone='warning'] { color: var(--cf-color-warning); }
    tbody th small b[data-tone='critical'] { color: var(--cf-color-critical); }
    tbody th small b[data-tone='healthy'], tbody th small b[data-tone='live'] { color: var(--cf-color-success); }
    .evidence-state { min-width: 72px; min-height: 42px; display: inline-grid; place-items: center; gap: 1px; border: 1px solid var(--cf-color-border-hairline); border-radius: 9px; background: rgb(255 255 255 / .02); }
    .evidence-state i { width: 20px; height: 20px; display: grid; place-items: center; border-radius: 50%; font-style: normal; font-size: 10px; font-weight: 800; }
    .evidence-state small { color: var(--cf-color-text-muted); font-size: 9px; }
    .evidence-state[data-present='true'] { border-color: color-mix(in srgb, var(--cf-color-success) 24%, transparent); background: color-mix(in srgb, var(--cf-color-success) 6%, transparent); }
    .evidence-state[data-present='true'] i { color: #06120e; background: var(--cf-color-success); }
    .evidence-state[data-present='false'] { border-color: color-mix(in srgb, var(--cf-color-warning) 28%, transparent); background: color-mix(in srgb, var(--cf-color-warning) 7%, transparent); }
    .evidence-state[data-present='false'] i { color: #1a1002; background: var(--cf-color-warning); }
    .unavailable { color: var(--cf-color-text-dim); }
    .completion { font-size: 12px; font-variant-numeric: tabular-nums; }
    .completion[data-tone='healthy'] { color: var(--cf-color-success); }
    .completion[data-tone='warning'] { color: var(--cf-color-warning); }
    .completion[data-tone='critical'] { color: var(--cf-color-critical); }
    .evidence-empty { min-height: 180px; display: grid; place-items: center; color: var(--cf-color-text-muted); font-size: 12px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvidenceMatrixComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly headers = input<readonly EvidenceMatrixCell[]>([]);
  readonly rows = input<readonly EvidenceMatrixRow[]>([]);
  readonly selected = output<EvidenceMatrixRow>();

  cell(row: EvidenceMatrixRow, key: string): EvidenceMatrixCell | null {
    return row.cells.find(item => item.key === key) ?? null;
  }
}
