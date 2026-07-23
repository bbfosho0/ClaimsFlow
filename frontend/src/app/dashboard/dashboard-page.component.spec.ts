import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardPageComponent } from './dashboard-page.component';
import { DashboardService } from './dashboard.service';

describe('DashboardPageComponent', () => {
  it('renders backend metrics and adjuster workload', async () => {
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
              recentActivity: [],
            }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Open claims');
    expect(fixture.nativeElement.textContent).toContain('7');
    expect(fixture.nativeElement.textContent).toContain('Maya Chen');
    expect(fixture.nativeElement.textContent).toContain('5 of 12 active');
  });
});
