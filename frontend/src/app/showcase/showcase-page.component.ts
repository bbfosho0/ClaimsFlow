import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommandFieldComponent } from '../shared/visualizations/command-field.component';

type ShowcaseState = 'initial' | 'signalLock' | 'ready';

@Component({
  standalone: true,
  imports: [RouterLink, CommandFieldComponent],
  templateUrl: './showcase-page.component.html',
  styleUrl: './showcase-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePageComponent implements OnInit, OnDestroy {
  readonly state = signal<ShowcaseState>('initial');
  readonly reducedMotion = signal(false);
  private readonly timers: number[] = [];

  ngOnInit(): void {
    const media = typeof globalThis.matchMedia === 'function'
      ? globalThis.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    this.reducedMotion.set(media?.matches ?? false);

    if (this.reducedMotion()) {
      this.state.set('ready');
      return;
    }

    this.timers.push(globalThis.setTimeout(() => this.state.set('signalLock'), 650));
    this.timers.push(globalThis.setTimeout(() => this.state.set('ready'), 1380));
  }

  ngOnDestroy(): void {
    this.timers.forEach(timer => globalThis.clearTimeout(timer));
  }

  skipIntro(): void {
    this.timers.forEach(timer => globalThis.clearTimeout(timer));
    this.state.set('ready');
  }
}
