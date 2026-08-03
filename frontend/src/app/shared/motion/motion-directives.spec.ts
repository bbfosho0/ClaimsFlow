import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoAnimateDirective } from './auto-animate.directive';
import { GsapRevealDirective } from './gsap-reveal.directive';

@Component({
  standalone: true,
  imports: [AutoAnimateDirective, GsapRevealDirective],
  template: `
    <div appAutoAnimate="subtle"><span>Item</span></div>
    <section appGsapReveal="metrics"><article>Metric</article></section>
    <div cfAutoAnimate><span>Compatible</span></div>
    <section cfGsapReveal><article>Compatible reveal</article></section>
  `,
})
class MotionHostComponent {}

describe('motion directives', () => {
  let originalMatchMedia: typeof globalThis.matchMedia;

  beforeEach(async () => {
    originalMatchMedia = globalThis.matchMedia;
    Object.defineProperty(globalThis, 'matchMedia', {
      configurable: true,
      value: jasmine.createSpy('matchMedia').and.callFake((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      })),
    });
    await TestBed.configureTestingModule({ imports: [MotionHostComponent] }).compileComponents();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'matchMedia', { configurable: true, value: originalMatchMedia });
  });

  it('accepts app and compatibility aliases without animating under reduced motion', () => {
    const fixture: ComponentFixture<MotionHostComponent> = TestBed.createComponent(MotionHostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelectorAll('[appautoanimate], [cfautoanimate]').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('[appgsapreveal], [cfgsapreveal]').length).toBe(2);
    expect(() => fixture.destroy()).not.toThrow();
  });
});
