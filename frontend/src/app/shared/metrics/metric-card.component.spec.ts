import { TestBed } from '@angular/core/testing';
import { ReducedMotionService } from '../operational/reduced-motion.service';
import { MetricCardComponent } from './metric-card.component';

describe('MetricCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCardComponent],
      providers: [{ provide: ReducedMotionService, useValue: { reduced: () => true } }],
    }).compileComponents();
  });

  it('renders a labelled hero metric with definition, value, helper, and delta', () => {
    const fixture = TestBed.createComponent(MetricCardComponent);
    fixture.componentRef.setInput('label', 'Estimated exposure');
    fixture.componentRef.setInput('value', 2750000);
    fixture.componentRef.setInput('format', 'currency');
    fixture.componentRef.setInput('variant', 'hero');
    fixture.componentRef.setInput('helper', 'Estimated loss across open claims');
    fixture.componentRef.setInput('definition', 'Sum of estimated loss for open claims.');
    fixture.componentRef.setInput('delta', { kind: 'PERCENTAGE', percentage: 8 });
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('article');
    expect(card.getAttribute('data-variant')).toBe('hero');
    expect(card.textContent).toContain('Estimated exposure');
    expect(card.textContent).toContain('$2.8M');
    expect(card.textContent).toContain('Estimated loss across open claims');
    expect(card.querySelector('[aria-label="Metric definition"]').getAttribute('title'))
      .toBe('Sum of estimated loss for open claims.');
  });

  it('preserves the last value and marks the card stale during a failed refresh', () => {
    const fixture = TestBed.createComponent(MetricCardComponent);
    fixture.componentRef.setInput('label', 'Open claims');
    fixture.componentRef.setInput('value', 41);
    fixture.componentRef.setInput('stale', true);
    fixture.componentRef.setInput('staleMessage', 'Showing the last successful update. Refresh failed at 1:05 PM.');
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('article');
    expect(card.textContent).toContain('41');
    expect(card.getAttribute('data-stale')).toBe('true');
    expect(card.textContent).toContain('Showing the last successful update');
  });

  it('uses a geometry-preserving skeleton instead of an empty card while loading', () => {
    const fixture = TestBed.createComponent(MetricCardComponent);
    fixture.componentRef.setInput('label', 'SLA pressure');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"][aria-label="Loading SLA pressure"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.metric-card-skeleton')).not.toBeNull();
  });
});
