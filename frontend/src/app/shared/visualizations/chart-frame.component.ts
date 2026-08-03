import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-chart-frame',
  standalone: true,
  template: `
    <section class="chart-frame" [attr.data-stale]="stale() ? 'true' : null">
      <header>
        <div>
          <h2>{{ title() }}</h2>
          @if (subtitle()) { <p>{{ subtitle() }}</p> }
        </div>
        <div class="chart-frame-actions"><ng-content select="[chart-actions]" /></div>
      </header>
      <div class="chart-frame-metrics"><ng-content select="[chart-metrics]" /></div>
      <div class="chart-frame-body"><ng-content /></div>
      @if (stale()) { <p class="chart-frame-stale" role="status">{{ staleMessage() }}</p> }
    </section>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .chart-frame {
      min-width: 0;
      height: 100%;
      border: 1px solid color-mix(in srgb, var(--cf-color-brand-lilac) 16%, transparent);
      border-radius: 20px;
      padding: 20px;
      background: linear-gradient(180deg, rgb(255 255 255 / .022), transparent 22%), var(--cf-color-surface-default);
      box-shadow: inset 0 1px rgb(255 255 255 / .03), 0 20px 60px rgb(0 0 0 / .25);
    }
    header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
    h2 { margin: 0; font-size: 18px; line-height: 24px; font-weight: 650; letter-spacing: -.025em; }
    p { margin: 3px 0 0; color: var(--cf-color-text-muted); font-size: 11px; line-height: 1.5; }
    .chart-frame-actions, .chart-frame-metrics { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .chart-frame-metrics:empty, .chart-frame-actions:empty { display: none; }
    .chart-frame-metrics { margin: -3px 0 14px; }
    .chart-frame-body { min-width: 0; }
    .chart-frame-stale { color: var(--cf-color-warning); }
    .chart-frame[data-stale='true'] { border-color: color-mix(in srgb, var(--cf-color-warning) 24%, var(--cf-color-border-subtle)); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartFrameComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly stale = input(false);
  readonly staleMessage = input('Showing the last successful update.');
}
