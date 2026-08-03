import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import gsap from 'gsap';

@Directive({
  selector: '[cfGsapReveal]',
  standalone: true,
})
export class GsapRevealDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private context: gsap.Context | null = null;

  @Input() cfGsapReveal = ':scope > *';
  @Input() gsapRevealStagger = 0.055;
  @Input() gsapRevealDelay = 0;

  ngAfterViewInit(): void {
    const host = this.element.nativeElement;
    const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    this.context = gsap.context(() => {
      gsap.from(this.cfGsapReveal, {
        autoAlpha: 0,
        y: 12,
        duration: 0.46,
        delay: this.gsapRevealDelay,
        stagger: this.gsapRevealStagger,
        ease: 'power3.out',
        clearProps: 'opacity,visibility,transform',
      });
    }, host);
  }

  ngOnDestroy(): void {
    this.context?.revert();
    this.context = null;
  }
}
