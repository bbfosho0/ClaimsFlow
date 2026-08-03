import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MetricStripSegment } from './metric-card.models';

@Component({
  selector: 'app-metric-stacked-strip',
  standalone: true,
  template: `
    <div class="stacked-strip" role="img" [attr.aria-label]="description()">
      @for (segment of segments(); track segment.label) {
        <span
          [attr.data-tone]="segment.tone"
          [style.flex-grow]="segment.value"
          [attr.title]="segment.label + ': ' + segment.value"></span>
      }
    </div>
    <div class="stacked-labels" aria-hidden="true">
      @for (segment of segments(); track segment.label) {
        <span [attr.data-tone]="segment.tone"><i></i>{{ segment.label }} <b>{{ segment.value }}</b></span>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .stacked-strip { height: 7px; display: flex; overflow: hidden; border-radius: 999px; background: rgb(255 255 255 / .055); }
    .stacked-strip > span { min-width: 2px; background: var(--strip-tone); transition: flex-grow 280ms var(--cf-ease-standard); }
    [data-tone='brand'], [data-tone='advisory'] { --strip-tone: var(--cf-color-brand-lilac); }
    [data-tone='live'] { --strip-tone: var(--cf-color-live); }
    [data-tone='healthy'] { --strip-tone: var(--cf-color-success); }
    [data-tone='warning'] { --strip-tone: var(--cf-color-warning); }
    [data-tone='critical'] { --strip-tone: var(--cf-color-critical); }
    [data-tone='neutral'] { --strip-tone: var(--cf-color-text-muted); }
    .stacked-labels { display: flex; flex-wrap: wrap; gap: 7px 12px; margin-top: 8px; color: var(--cf-color-text-muted); font-size: 10px; }
    .stacked-labels span { display: inline-flex; align-items: center; gap: 5px; }
    .stacked-labels i { width: 6px; height: 6px; border-radius: 50%; background: var(--strip-tone); }
    .stacked-labels b { color: var(--cf-color-text-secondary); font-variant-numeric: tabular-nums; }
    @media (prefers-reduced-motion: reduce) { .stacked-strip > span { transition: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricStackedStripComponent {
  readonly segments = input<readonly MetricStripSegment[]>([]);
  readonly label = input.required<string>();
  readonly description = computed(() => `${this.label()}: ${this.segments().map(segment => `${segment.label} ${segment.value}`).join(', ')}`);
}
