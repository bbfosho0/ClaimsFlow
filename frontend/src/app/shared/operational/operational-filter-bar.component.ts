import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  DEFAULT_OPERATIONAL_FILTERS,
  OperationalFilterOptions,
  OperationalFilters,
} from '../../core/operational-data/operational-data.models';

@Component({
  selector: 'app-operational-filter-bar',
  standalone: true,
  template: `
    <section class="operational-filter-bar" aria-label="Operational filters">
      <label>
        <span>From</span>
        <input type="date" [value]="filters().from" (change)="change('from', value($event))" />
      </label>
      <label>
        <span>To</span>
        <input type="date" [value]="filters().to" (change)="change('to', value($event))" />
      </label>
      <label>
        <span>Claim type</span>
        <select [value]="filters().claimType" (change)="change('claimType', value($event))">
          <option value="">All types</option>
          @for (option of options().claimTypes; track option) {
            <option [value]="option">{{ label(option) }}</option>
          }
        </select>
      </label>
      <label>
        <span>Priority</span>
        <select [value]="filters().priority" (change)="change('priority', value($event))">
          <option value="">All priorities</option>
          @for (option of options().priorities; track option) {
            <option [value]="option">{{ label(option) }}</option>
          }
        </select>
      </label>
      <label>
        <span>Status</span>
        <select [value]="filters().status" (change)="change('status', value($event))">
          <option value="">All statuses</option>
          @for (option of options().statuses; track option) {
            <option [value]="option">{{ label(option) }}</option>
          }
        </select>
      </label>
      <label>
        <span>Team</span>
        <select [value]="filters().team" (change)="changeTeam(value($event))">
          <option value="">All teams</option>
          @for (option of options().teams; track option) {
            <option [value]="option">{{ option }}</option>
          }
        </select>
      </label>
      <label>
        <span>Adjuster</span>
        <select [value]="filters().adjusterId" (change)="changeAdjuster(value($event))">
          <option value="">All adjusters</option>
          @for (option of options().adjusters; track option.id) {
            <option [value]="option.id">{{ option.displayName }}</option>
          }
        </select>
      </label>
      <label>
        <span>Region</span>
        <select [value]="filters().region" (change)="change('region', value($event))">
          <option value="">All regions</option>
          @for (option of options().regions; track option) {
            <option [value]="option">{{ label(option) }}</option>
          }
        </select>
      </label>
      <button type="button" class="reset" (click)="reset()">Reset filters</button>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .operational-filter-bar { display: flex; align-items: end; gap: 8px; padding: 10px; overflow-x: auto; border: 1px solid var(--cf-color-border-subtle); border-radius: var(--cf-radius-card); background: rgb(9 20 31 / .9); box-shadow: var(--cf-shadow-standard); }
    label { min-width: 118px; display: grid; gap: 5px; }
    label span { color: var(--cf-color-text-muted); font-size: 8px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
    input, select, button { height: 36px; border: 1px solid var(--cf-color-border-subtle); border-radius: 9px; color: var(--cf-color-text-secondary); background: var(--cf-color-surface-default); font: inherit; font-size: 10px; }
    input, select { width: 100%; padding: 0 9px; }
    input:focus-visible, select:focus-visible, button:focus-visible { outline: 2px solid var(--cf-color-activity-live); outline-offset: 2px; }
    .reset { min-width: 96px; padding: 0 12px; cursor: pointer; transition: transform var(--cf-duration-fast), border-color var(--cf-duration-fast); }
    .reset:hover { transform: translateY(-1px); border-color: var(--cf-color-border-strong); }
    @media (max-width: 720px) { .operational-filter-bar { scroll-snap-type: x proximity; } label { scroll-snap-align: start; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationalFilterBarComponent {
  readonly filters = input.required<OperationalFilters>();
  readonly options = input.required<OperationalFilterOptions>();
  readonly filtersChange = output<OperationalFilters>();

  value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  change(key: keyof OperationalFilters, value: string): void {
    this.filtersChange.emit({ ...this.filters(), [key]: value } as OperationalFilters);
  }

  changeTeam(team: string): void {
    this.filtersChange.emit({ ...this.filters(), team, adjusterId: '' });
  }

  changeAdjuster(adjusterId: string): void {
    this.filtersChange.emit({ ...this.filters(), adjusterId, team: '' });
  }

  reset(): void {
    this.filtersChange.emit(DEFAULT_OPERATIONAL_FILTERS);
  }

  label(value: string): string {
    const text = value.toLowerCase().replaceAll('_', ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
