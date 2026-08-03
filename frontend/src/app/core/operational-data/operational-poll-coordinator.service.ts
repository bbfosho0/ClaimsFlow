import { Injectable, OnDestroy } from '@angular/core';

const POLL_INTERVAL_MS = 45_000;

interface Registration {
  count: number;
  refresh: () => void;
}

@Injectable({ providedIn: 'root' })
export class OperationalPollCoordinator implements OnDestroy {
  private readonly registrations = new Map<string, Registration>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;
  private readonly visibilityHandler = () => this.onVisibilityChange();

  constructor() {
    globalThis.document?.addEventListener('visibilitychange', this.visibilityHandler);
  }

  register(key: string, refresh: () => void): () => void {
    const current = this.registrations.get(key);
    if (current) {
      current.count += 1;
      current.refresh = refresh;
    } else {
      this.registrations.set(key, { count: 1, refresh });
    }
    this.start();

    let released = false;
    return () => {
      if (released) return;
      released = true;
      const registration = this.registrations.get(key);
      if (!registration) return;
      registration.count -= 1;
      if (registration.count <= 0) this.registrations.delete(key);
      if (this.registrations.size === 0) this.stop();
    };
  }

  isActive(key: string): boolean {
    return this.registrations.has(key);
  }

  ngOnDestroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stop();
    this.registrations.clear();
    globalThis.document?.removeEventListener('visibilitychange', this.visibilityHandler);
  }

  private onVisibilityChange(): void {
    if (globalThis.document?.visibilityState === 'hidden') {
      this.stop();
      return;
    }
    this.refreshAll();
    this.start();
  }

  private refreshAll(): void {
    if (globalThis.document?.visibilityState === 'hidden') return;
    for (const registration of this.registrations.values()) registration.refresh();
  }

  private start(): void {
    if (
      this.destroyed
      || this.timer
      || this.registrations.size === 0
      || globalThis.document?.visibilityState === 'hidden'
    ) return;
    this.timer = setInterval(() => this.refreshAll(), POLL_INTERVAL_MS);
  }

  private stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }
}
