import { TestBed } from '@angular/core/testing';
import { ReducedMotionService } from '../operational/reduced-motion.service';
import { LineAreaChartComponent } from './line-area-chart.component';

describe('LineAreaChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineAreaChartComponent],
      providers: [{ provide: ReducedMotionService, useValue: { reduced: () => true } }],
    }).compileComponents();
  });

  it('renders accessible SVG metadata, focusable marks, and an exact-value table', () => {
    const fixture = TestBed.createComponent(LineAreaChartComponent);
    fixture.componentRef.setInput('title', 'Portfolio pulse');
    fixture.componentRef.setInput('description', 'Active inventory, created claims, and resolved claims by date.');
    fixture.componentRef.setInput('series', [
      { key: 'active', label: 'Active inventory', tone: 'brand', area: true, points: [{ label: 'Aug 1', value: 42 }, { label: 'Aug 2', value: 39 }] },
      { key: 'resolved', label: 'Resolved', tone: 'healthy', points: [{ label: 'Aug 1', value: 3 }, { label: 'Aug 2', value: 5 }] },
    ]);
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.querySelector('title').textContent).toContain('Portfolio pulse');
    expect(svg.querySelector('desc').textContent).toContain('Active inventory');
    expect(fixture.nativeElement.querySelectorAll('circle[tabindex="0"]').length).toBe(4);
    expect(fixture.nativeElement.querySelector('[data-chart-summary]').textContent).toContain('Aug 2');
    expect(fixture.nativeElement.querySelector('[data-chart-summary]').textContent).toContain('39');
  });

  it('renders a useful no-data state instead of an empty SVG', () => {
    const fixture = TestBed.createComponent(LineAreaChartComponent);
    fixture.componentRef.setInput('title', 'Portfolio pulse');
    fixture.componentRef.setInput('description', 'Portfolio trend.');
    fixture.componentRef.setInput('series', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No data available for Portfolio pulse.');
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });
});
