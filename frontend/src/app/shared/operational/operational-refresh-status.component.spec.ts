import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OperationalClockService } from '../../core/operational-data/operational-clock.service';
import { OperationalResource } from '../../core/operational-data/operational-data.models';
import { OperationalRefreshStatusComponent } from './operational-refresh-status.component';

describe('OperationalRefreshStatusComponent', () => {
  const now = signal(Date.parse('2026-08-03T12:00:00Z'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationalRefreshStatusComponent],
      providers: [{ provide: OperationalClockService, useValue: { now: now.asReadonly() } }],
    }).compileComponents();
  });

  it('renders loading and disables refresh during the initial request', () => {
    const fixture = TestBed.createComponent(OperationalRefreshStatusComponent);
    fixture.componentRef.setInput('resource', resource({ loading: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading operational data…');
    expect((fixture.nativeElement.querySelector('button') as HTMLButtonElement).disabled).toBeTrue();
  });

  it('renders a truthful update age from the shared clock', () => {
    const fixture = TestBed.createComponent(OperationalRefreshStatusComponent);
    fixture.componentRef.setInput('resource', resource({
      value: { count: 1 },
      updatedAt: new Date('2026-08-03T11:58:00Z'),
    }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Updated 2 minutes ago');
  });

  it('retains stale data messaging and emits manual refresh', () => {
    const fixture = TestBed.createComponent(OperationalRefreshStatusComponent);
    fixture.componentRef.setInput('resource', resource({
      value: { count: 1 },
      stale: true,
      error: 'temporarily unavailable',
      updatedAt: new Date('2026-08-03T11:59:58Z'),
    }));
    const requested = jasmine.createSpy('requested');
    fixture.componentInstance.refreshRequested.subscribe(requested);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Showing the last successful update.');
    fixture.nativeElement.querySelector('button').click();
    expect(requested).toHaveBeenCalledTimes(1);
  });
});

function resource<T>(overrides: Partial<OperationalResource<T>>): OperationalResource<T> {
  return {
    value: null,
    loading: false,
    refreshing: false,
    stale: false,
    error: '',
    updatedAt: null,
    changedClaimIds: [],
    ...overrides,
  };
}
