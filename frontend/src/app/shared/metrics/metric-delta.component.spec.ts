import { TestBed } from '@angular/core/testing';
import { MetricDeltaComponent } from './metric-delta.component';

describe('MetricDeltaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MetricDeltaComponent] }).compileComponents();
  });

  it('renders truthful zero-denominator comparison labels', () => {
    const fixture = TestBed.createComponent(MetricDeltaComponent);
    fixture.componentRef.setInput('change', { kind: 'NEW', percentage: null });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('New vs prior period');

    fixture.componentRef.setInput('change', { kind: 'CLEARED', percentage: null });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cleared vs prior period');
  });

  it('treats a decrease as positive for inverse operational metrics', () => {
    const fixture = TestBed.createComponent(MetricDeltaComponent);
    fixture.componentRef.setInput('change', { kind: 'PERCENTAGE', percentage: -12.5 });
    fixture.componentRef.setInput('inverse', true);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('[data-tone]');
    expect(badge.textContent).toContain('-12.5% vs prior period');
    expect(badge.getAttribute('data-tone')).toBe('positive');
  });

  it('exposes exact comparison periods and values to assistive technology', () => {
    const fixture = TestBed.createComponent(MetricDeltaComponent);
    fixture.componentRef.setInput('change', { kind: 'PERCENTAGE', percentage: 8 });
    fixture.componentRef.setInput('currentPeriod', 'Jul 1–Jul 30');
    fixture.componentRef.setInput('previousPeriod', 'Jun 1–Jun 30');
    fixture.componentRef.setInput('currentValue', '$2.7M');
    fixture.componentRef.setInput('previousValue', '$2.5M');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[aria-label]').getAttribute('aria-label'))
      .toContain('Jul 1–Jul 30: $2.7M; Jun 1–Jun 30: $2.5M');
  });
});
