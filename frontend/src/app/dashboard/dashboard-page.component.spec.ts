import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { ClaimDetail } from '../shared/models/claim.models';
import { DashboardPageComponent } from './dashboard-page.component';
import { DashboardService } from './dashboard.service';

const goldenClaim: ClaimDetail = {
  id: 'claim-demo',
  claimNumber: 'CLM-2026-DEMO',
  claimantName: 'Taylor Reed',
  claimantEmail: 'taylor.reed@example.com',
  claimType: 'PROPERTY',
  incidentDate: '2026-08-02',
  estimatedLoss: 18750,
  description: 'Property damage demo claim with evidence still required.',
  evidence: {
    incidentReportPresent: true,
    photosPresent: false,
    proofOfOwnershipPresent: false,
    medicalDocumentationPresent: false,
  },
  completenessPercentage: 50,
  missingEvidence: ['Damage photos', 'Proof of ownership'],
  priority: 'HIGH',
  priorityFactors: ['Estimated loss exceeds threshold'],
  status: 'UNDER_REVIEW',
  allowedNextStatuses: ['WAITING_FOR_INFORMATION', 'READY_FOR_DECISION'],
  slaDeadline: '2026-08-03T18:00:00Z',
  createdAt: '2026-08-03T05:00:00Z',
  updatedAt: '2026-08-03T05:30:00Z',
  version: 1,
};

const snapshot = {
  openClaims: 7,
  highPriorityClaims: 3,
  slaRiskClaims: 2,
  unassignedClaims: 1,
  incompleteClaims: 4,
  workload: [{ adjusterId: 'a1', displayName: 'Maya Chen', activeClaims: 5, capacity: 12 }],
  recentActivity: [{ actor: 'Interview User', actionType: 'CLAIM_CREATED', summary: 'Claim CF-2026-0142 created', occurredAt: '2026-08-02T12:00:00Z' }],
};

describe('DashboardPageComponent', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('renders portfolio operations and resolves the golden claim from a shareable query parameter', async () => {
    const claims = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['get']);
    claims.get.and.returnValue(of(goldenClaim));

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'dashboard', component: DashboardPageComponent }]),
        { provide: ClaimsApiService, useValue: claims },
        { provide: DashboardService, useValue: { load: () => of(snapshot) } },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard?claimId=claim-demo', DashboardPageComponent);
    harness.detectChanges();

    expect(claims.get).toHaveBeenCalledWith('claim-demo');
    expect(harness.routeNativeElement?.querySelector('[data-tour-target="manager-golden-journey"]')).not.toBeNull();
    expect(harness.routeNativeElement?.textContent).toContain('CLM-2026-DEMO');
    expect(harness.routeNativeElement?.textContent).toContain('Taylor Reed');
    expect(harness.routeNativeElement?.querySelector('[data-tour-target="priority-command"]')).not.toBeNull();
    expect(harness.routeNativeElement?.querySelectorAll('.instrument-cell').length).toBe(4);
    expect(harness.routeNativeElement?.textContent).toContain('Intervention queue');
    expect(harness.routeNativeElement?.textContent).toContain('Flow intelligence');
    expect(harness.routeNativeElement?.textContent).toContain('Team capacity');
    expect(harness.routeNativeElement?.textContent).toContain('Operational event feed');
  });
});
