import { Injectable, OnDestroy, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReducedMotionService implements OnDestroy {
  private readonly media = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
  readonly reduced = signal(this.media?.matches ?? false);
  private readonly listener = (event: MediaQueryListEvent) => this.reduced.set(event.matches);

  constructor() {
    this.media?.addEventListener?.('change', this.listener);
  }

  ngOnDestroy(): void {
    this.media?.removeEventListener?.('change', this.listener);
  }
}
