import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ReducedMotionService } from './reduced-motion.service';

export type AnimatedNumberFormat = 'integer' | 'decimal' | 'percentage' | 'currency' | 'hours';

@Component({
  selector: 'app-animated-number',
  standalone: true,
  template: `{{ text() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedNumberComponent implements OnDestroy {
  readonly value = input.required<number>();
  readonly format = input<AnimatedNumberFormat>('integer');
  readonly currency = input('USD');

  private readonly reducedMotion = inject(ReducedMotionService);
  private readonly displayed = signal(0);
  private initialized = false;
  private frame: number | null = null;

  readonly text = computed(() => this.formatValue(this.displayed()));

  constructor() {
    effect(() => {
      const target = Number.isFinite(this.value()) ? this.value() : 0;
      if (!this.initialized || this.reducedMotion.reduced()) {
        this.cancelFrame();
        this.displayed.set(target);
        this.initialized = true;
        return;
      }
      this.animateTo(target);
    });
  }

  ngOnDestroy(): void {
    this.cancelFrame();
  }

  private animateTo(target: number): void {
    this.cancelFrame();
    const start = this.displayed();
    if (start === target) return;
    const startedAt = performance.now();
    const durationMs = 220;

    const step = (timestamp: number) => {
      const progress = Math.min(1, (timestamp - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayed.set(start + (target - start) * eased);
      if (progress < 1) this.frame = requestAnimationFrame(step);
      else this.frame = null;
    };
    this.frame = requestAnimationFrame(step);
  }

  private cancelFrame(): void {
    if (this.frame === null) return;
    cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  private formatValue(value: number): string {
    switch (this.format()) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: this.currency(),
          notation: Math.abs(value) >= 100_000 ? 'compact' : 'standard',
          maximumFractionDigits: Math.abs(value) >= 100_000 ? 1 : 0,
        }).format(value);
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'decimal':
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
      case 'hours':
        return value >= 24
          ? `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value / 24)}d`
          : `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)}h`;
      default:
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
    }
  }
}
