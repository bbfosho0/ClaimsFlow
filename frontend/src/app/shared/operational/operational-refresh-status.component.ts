import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { OperationalClockService } from '../../core/operational-data/operational-clock.service';
import { OperationalResource } from '../../core/operational-data/operational-data.models';

@Component({
  selector: 'app-operational-refresh-status',
  standalone: true,
  template: `
    <div class="refresh-status" [attr.data-stale]="resource().stale || null">
      <span class="refresh-age" role="status" aria-live="polite">{{ statusText() }}</span>
      @if (resource().stale) {
        <span class="stale-copy">Showing the last successful update.</span>
      }
      <button
        type="button"
        (click)="refreshRequested.emit()"
        [disabled]="resource().loading || resource().refreshing">
        {{ resource().refreshing ? 'Updating…' : 'Refresh' }}
      </button>
    </div>
  `,
  styles: [`
    :host { display: inline-block; }
    .refresh-status { display: inline-flex; align-items: center; gap: 8px; color: var(--cf-color-text-muted); font-size: 10px; }
    .refresh-status[data-stale='true'] { color: var(--cf-color-risk-approaching); }
    .stale-copy { font-weight: 650; }
    button { min-height: 30px; padding: 0 10px; border: 1px solid var(--cf-color-border-subtle); border-radius: 999px; color: var(--cf-color-text-secondary); background: var(--cf-color-surface-default); cursor: pointer; transition: transform var(--cf-duration-fast) var(--cf-ease-operational), border-color var(--cf-duration-fast) var(--cf-ease-operational); }
    button:hover:not(:disabled) { transform: translateY(-1px); border-color: var(--cf-color-border-strong); }
    button:focus-visible { outline: 2px solid var(--cf-color-activity-live); outline-offset: 2px; }
    button:disabled { cursor: wait; opacity: .6; }
    @media (max-width: 620px) {
      :host, .refresh-status { width: 100%; }
      .refresh-status { justify-content: space-between; flex-wrap: wrap; }
      button { min-height: 44px; padding-inline: 14px; }
    }
    @media (prefers-reduced-motion: reduce) { button { transition: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationalRefreshStatusComponent {
  private readonly clock = inject(OperationalClockService);
  readonly resource = input.required<OperationalResource<unknown>>();
  readonly refreshRequested = output<void>();

  readonly statusText = computed(() => {
    const state = this.resource();
    if (state.loading && !state.value) return 'Loading operational data…';
    if (!state.updatedAt) return state.error || 'Not updated yet';
    const seconds = Math.max(0, Math.floor((this.clock.now() - state.updatedAt.getTime()) / 1_000));
    if (state.refreshing) return 'Updating…';
    if (seconds < 5) return 'Updated just now';
    if (seconds < 60) return `Updated ${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  });
}
