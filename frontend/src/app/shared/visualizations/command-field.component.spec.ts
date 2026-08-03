import { TestBed } from '@angular/core/testing';
import { DashboardSignalCount } from '../models/dashboard.models';
import { CommandFieldComponent, allocateSignals } from './command-field.component';

describe('CommandFieldComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CommandFieldComponent] }).compileComponents();
  });

  it('renders seventeen fallback operational signals and a textual summary', () => {
    const fixture = TestBed.createComponent(CommandFieldComponent);
    fixture.componentRef.setInput('activeCount', 17);
    fixture.componentRef.setInput('variant', 'showcase');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-signal]').length).toBe(17);
    expect(fixture.nativeElement.querySelector('figure')?.getAttribute('aria-label')).toContain('17 operational signals');
    expect(fixture.nativeElement.textContent).toContain('SLA pressure');
    expect(fixture.nativeElement.textContent).toContain('Missing evidence');
  });

  it('allocates backend signal composition proportionally while preserving every nonzero category', () => {
    const counts: DashboardSignalCount[] = [
      { category: 'SLA', tone: 'critical', count: 8 },
      { category: 'EVIDENCE', tone: 'warning', count: 5 },
      { category: 'OWNERSHIP', tone: 'live', count: 2 },
      { category: 'PRIORITY', tone: 'advisory', count: 1 },
      { category: 'ADVISORY', tone: 'healthy', count: 1 },
    ];

    const allocated = allocateSignals(counts, 17);
    expect(allocated.length).toBe(17);
    expect(allocated.filter(item => item.tone === 'critical').length).toBeGreaterThan(
      allocated.filter(item => item.tone === 'live').length,
    );
    expect(new Set(allocated.map(item => item.tone))).toEqual(
      new Set(['critical', 'warning', 'live', 'advisory', 'healthy']),
    );
  });

  it('renders live backend category tones and exact accessible counts', () => {
    const counts: DashboardSignalCount[] = [
      { category: 'SLA', tone: 'critical', count: 3 },
      { category: 'EVIDENCE', tone: 'warning', count: 4 },
      { category: 'OWNERSHIP', tone: 'live', count: 1 },
      { category: 'PRIORITY', tone: 'advisory', count: 2 },
      { category: 'ADVISORY', tone: 'healthy', count: 5 },
    ];
    const fixture = TestBed.createComponent(CommandFieldComponent);
    fixture.componentRef.setInput('signalCounts', counts);
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('figure')?.getAttribute('aria-label') ?? '';
    expect(label).toContain('3 SLA pressure');
    expect(label).toContain('4 Evidence incomplete');
    expect(fixture.nativeElement.querySelectorAll('[data-signal]').length).toBe(15);
    expect(fixture.nativeElement.querySelectorAll('[data-tone="critical"]').length).toBeGreaterThan(0);
  });

  it('allocates no nodes for an all-zero backend snapshot', () => {
    const allocated = allocateSignals([
      { category: 'SLA', tone: 'critical', count: 0 },
      { category: 'EVIDENCE', tone: 'warning', count: 0 },
    ], 17);
    expect(allocated).toEqual([]);
  });
});
