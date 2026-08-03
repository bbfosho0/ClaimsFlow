import { Directive, ElementRef, OnDestroy, Renderer2, effect, inject, input } from '@angular/core';
import { ReducedMotionService } from './reduced-motion.service';

@Directive({
  selector: '[appChangedValue]',
  standalone: true,
})
export class ChangedValueDirective implements OnDestroy {
  readonly value = input<unknown>(undefined, { alias: 'appChangedValue' });
  readonly changeTone = input('live');

  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly reducedMotion = inject(ReducedMotionService);
  private initialized = false;
  private previous: unknown;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const next = this.value();
      if (!this.initialized) {
        this.initialized = true;
        this.previous = next;
        return;
      }
      if (Object.is(next, this.previous)) return;
      this.previous = next;
      if (this.reducedMotion.reduced()) return;
      this.highlight();
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  private highlight(): void {
    if (this.timer) clearTimeout(this.timer);
    this.renderer.setAttribute(this.element.nativeElement, 'data-change-tone', this.changeTone());
    this.renderer.addClass(this.element.nativeElement, 'cf-value-changed');
    this.timer = setTimeout(() => {
      this.renderer.removeClass(this.element.nativeElement, 'cf-value-changed');
      this.renderer.removeAttribute(this.element.nativeElement, 'data-change-tone');
      this.timer = null;
    }, 1_200);
  }
}
