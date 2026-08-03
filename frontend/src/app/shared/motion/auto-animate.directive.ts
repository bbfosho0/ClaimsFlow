import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { AutoAnimateOptions, AnimationController, autoAnimate } from '@formkit/auto-animate';

@Directive({
  selector: '[cfAutoAnimate],[appAutoAnimate]',
  standalone: true,
})
export class AutoAnimateDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private controller: AnimationController | null = null;
  private options: Partial<AutoAnimateOptions> | '' = '';

  @Input()
  set cfAutoAnimate(value: Partial<AutoAnimateOptions> | '') { this.options = value; }

  @Input()
  set appAutoAnimate(value: Partial<AutoAnimateOptions> | string | '') {
    this.options = typeof value === 'object' ? value : '';
  }

  ngAfterViewInit(): void {
    if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    this.controller = autoAnimate(this.element.nativeElement, this.options || {
      duration: 180,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
    });
  }

  ngOnDestroy(): void {
    this.controller?.disable();
    this.controller = null;
  }
}
