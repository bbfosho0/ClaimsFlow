import { signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AnimatedNumberComponent } from './animated-number.component';
import { ReducedMotionService } from './reduced-motion.service';

describe('AnimatedNumberComponent', () => {
  const reduced = signal(false);

  beforeEach(async () => {
    reduced.set(false);
    await TestBed.configureTestingModule({
      imports: [AnimatedNumberComponent],
      providers: [{ provide: ReducedMotionService, useValue: { reduced } }],
    }).compileComponents();
  });

  it('renders the initial value immediately and animates only subsequent changes', fakeAsync(() => {
    const fixture = TestBed.createComponent(AnimatedNumberComponent);
    fixture.componentRef.setInput('value', 10);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('10');

    fixture.componentRef.setInput('value', 20);
    fixture.detectChanges();
    tick(110);
    fixture.detectChanges();
    const midpoint = Number(fixture.nativeElement.textContent.trim());
    expect(midpoint).toBeGreaterThan(10);
    expect(midpoint).toBeLessThan(20);

    tick(160);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('20');
  }));

  it('updates immediately when reduced motion is enabled', () => {
    reduced.set(true);
    const fixture = TestBed.createComponent(AnimatedNumberComponent);
    fixture.componentRef.setInput('value', 10);
    fixture.detectChanges();
    fixture.componentRef.setInput('value', 75);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('75');
  });

  it('formats truthful percentage, currency, and duration values', () => {
    const percentage = TestBed.createComponent(AnimatedNumberComponent);
    percentage.componentRef.setInput('value', 78);
    percentage.componentRef.setInput('format', 'percentage');
    percentage.detectChanges();
    expect(percentage.nativeElement.textContent.trim()).toBe('78%');

    const currency = TestBed.createComponent(AnimatedNumberComponent);
    currency.componentRef.setInput('value', 125000);
    currency.componentRef.setInput('format', 'currency');
    currency.detectChanges();
    expect(currency.nativeElement.textContent).toContain('$125K');

    const duration = TestBed.createComponent(AnimatedNumberComponent);
    duration.componentRef.setInput('value', 48);
    duration.componentRef.setInput('format', 'hours');
    duration.detectChanges();
    expect(duration.nativeElement.textContent.trim()).toBe('2d');
  });
});
