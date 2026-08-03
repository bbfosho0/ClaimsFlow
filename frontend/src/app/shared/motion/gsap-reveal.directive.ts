import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import gsap from 'gsap';

@Directive({
  selector: '[cfGsapReveal],[appGsapReveal]',
  standalone: true,
})
export class GsapRevealDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private context: gsap.Context | null = null;
  private selector = ':scope > *';

  @Input()
  set cfGsapReveal(value: string) { this.selector = this.resolveSelector(value); }

  @Input()
  set appGsapReveal(value: string) { this.selector = this.resolveSelector(value); }

  @Input() gsapRevealStagger = 0.055;
  @Input() gsapRevealDelay = 0;

  ngAfterViewInit(): void {
    const host = this.element.nativeElement;
    const media = gsap.matchMedia(host);
    this.context = gsap.context(() => {
      media.add({ reduceMotion: '(prefers-reduced-motion: reduce)' }, context => {
        if (context.conditions?.['reduceMotion']) {
          gsap.set(this.selector, { clearProps: 'opacity,visibility,transform' });
          return;
        }
        gsap.from(this.selector, {
          autoAlpha: 0,
          y: 12,
          duration: 0.46,
          delay: this.gsapRevealDelay,
          stagger: this.gsapRevealStagger,
          ease: 'power3.out',
          clearProps: 'opacity,visibility,transform',
        });
      });
    }, host);
  }

  ngOnDestroy(): void {
    this.context?.revert();
    this.context = null;
  }

  private resolveSelector(value: string): string {
    return value && !['metrics', 'chart', 'panel', 'subtle'].includes(value) ? value : ':scope > *';
  }
}
