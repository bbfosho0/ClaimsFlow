import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { AutoAnimateOptions, AnimationController, autoAnimate } from '@formkit/auto-animate';

@Directive({
  selector: '[cfAutoAnimate]',
  standalone: true,
})
export class AutoAnimateDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private controller: AnimationController | null = null;

  @Input() cfAutoAnimate: Partial<AutoAnimateOptions> | '' = '';

  ngAfterViewInit(): void {
    if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const options = this.cfAutoAnimate || {
      duration: 180,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
    };
    this.controller = autoAnimate(this.element.nativeElement, options);
  }

  ngOnDestroy(): void {
    this.controller?.disable();
    this.controller = null;
  }
}
