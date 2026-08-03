import { ChangeDetectionStrategy, Component, OnDestroy, computed, input, output, signal } from '@angular/core';
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
    button { min-height: 30px; padding: 0 10px; border: 1px solid var(--cf-color-border-subtle); border-radius: 999px; color: var(--cf-color-text-secondary); background: var(--cf-color-surface-default); cursor: pointer; transition: transform var(--cf-duration-fast), border-color var(--cf-duration-fast); }
    button:hover:not(:disabled) { transform: translateY(-1px); border-color: var(--cf-color-border-strong); }
    button:disabled { cursor: wait; opacity: .6; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationalRefreshStatusComponent implements OnDestroy {
  readonly resource = input.required<OperationalResource<unknown>>();
  readonly refreshRequested = output<void>();
  private readonly now = signal(Date.now());
  private readonly timer = setInterval(() => this.now.set(Date.now()), 1_000);

  readonly statusText = computed(() => {
    const state = this.resource();
    if (state.loading && !state.value) return 'Loading operational data…';
    if (!state.updatedAt) return state.error || 'Not updated yet';
    const seconds = Math.max(0, Math.floor((this.now() - state.updatedAt.getTime()) / 1_000));
    if (state.refreshing) return 'Updating…';
    if (seconds < 5) return 'Updated just now';
    if (seconds < 60) return `Updated ${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  });

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
