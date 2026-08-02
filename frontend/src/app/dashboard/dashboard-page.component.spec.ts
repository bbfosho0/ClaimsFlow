import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardPageComponent } from './dashboard-page.component';
import { DashboardService } from './dashboard.service';

describe('DashboardPageComponent', () => {
  it('renders the command field, instrument band, interventions, capacity, and event feed', async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: DashboardService,
          useValue: {
            load: () => of({
              openClaims: 7,
              highPriorityClaims: 3,
              slaRiskClaims: 2,
              unassignedClaims: 1,
              incompleteClaims: 4,
              workload: [{ adjusterId: 'a1', displayName: 'Maya Chen', activeClaims: 5, capacity: 12 }],
              recentActivity: [{ actor: 'Interview User', actionType: 'CLAIM_CREATED', summary: 'Claim CF-2026-0142 created', occurredAt: '2026-08-02T12:00:00Z' }],
            }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-tour-target="priority-command"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.instrument-cell').length).toBe(4);
    expect(fixture.nativeElement.textContent).toContain('Intervention queue');
    expect(fixture.nativeElement.textContent).toContain('Flow intelligence');
    expect(fixture.nativeElement.textContent).toContain('Team capacity');
    expect(fixture.nativeElement.textContent).toContain('Operational event feed');
    expect(fixture.nativeElement.textContent).toContain('Maya Chen');
    expect(fixture.nativeElement.textContent).toContain('Claim CF-2026-0142 created');
  });
});
