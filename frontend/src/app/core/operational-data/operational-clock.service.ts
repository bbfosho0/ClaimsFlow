import { Injectable, OnDestroy, Signal, signal } from '@angular/core';

const CLOCK_INTERVAL_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class OperationalClockService implements OnDestroy {
  private readonly current = signal(Date.now());
  private timer: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;
  private readonly visibilityHandler = () => this.onVisibilityChange();

  readonly now: Signal<number> = this.current.asReadonly();

  constructor() {
    globalThis.document?.addEventListener('visibilitychange', this.visibilityHandler);
    this.start();
  }

  ngOnDestroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stop();
    globalThis.document?.removeEventListener('visibilitychange', this.visibilityHandler);
  }

  private onVisibilityChange(): void {
    if (globalThis.document?.visibilityState === 'hidden') {
      this.stop();
      return;
    }
    this.current.set(Date.now());
    this.start();
  }

  private start(): void {
    if (this.destroyed || this.timer || globalThis.document?.visibilityState === 'hidden') return;
    this.timer = setInterval(() => this.current.set(Date.now()), CLOCK_INTERVAL_MS);
  }

  private stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }
}
