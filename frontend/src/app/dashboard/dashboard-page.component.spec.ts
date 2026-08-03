import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { ClaimDetail } from '../shared/models/claim.models';
import { DashboardSnapshot } from '../shared/models/dashboard.models';
import { DashboardPageComponent } from './dashboard-page.component';

const goldenClaim: ClaimDetail = {
  id: 'claim-demo',
  claimNumber: 'CLM-2026-DEMO',
  claimantName: 'Taylor Reed',
  claimantEmail: 'taylor.reed@example.com',
  claimType: 'PROPERTY',
  region: 'SOUTHEAST',
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

const snapshot: DashboardSnapshot = {
  generatedAt: '2026-08-03T12:00:00Z',
  totalClaims: 11,
  openClaims: 7,
  highPriorityClaims: 3,
  slaRiskClaims: 2,
  overdueClaims: 1,
  unassignedClaims: 1,
  incompleteClaims: 4,
  evidenceReadinessPercentage: 78,
  activePortfolioPercentage: 64,
  signalCounts: [
    { category: 'SLA', tone: 'critical', count: 3 },
    { category: 'EVIDENCE', tone: 'warning', count: 4 },
    { category: 'OWNERSHIP', tone: 'live', count: 1 },
    { category: 'PRIORITY', tone: 'advisory', count: 3 },
    { category: 'ADVISORY', tone: 'healthy', count: 4 },
  ],
  workload: [{ adjusterId: 'a1', displayName: 'Maya Chen', team: 'Claims Intake', activeClaims: 5, capacity: 12 }],
  recentActivity: [{ claimId: 'claim-demo', actor: 'Interview User', actionType: 'CLAIM_CREATED', summary: 'Claim CLM-2026-DEMO created', occurredAt: '2026-08-02T12:00:00Z' }],
};

describe('DashboardPageComponent', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('renders the reactive portfolio snapshot and resolves the golden claim from the URL', async () => {
    const claims = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['get']);
    claims.get.and.returnValue(of(goldenClaim));
    const resource = signal({
      value: snapshot,
      loading: false,
      refreshing: false,
      stale: false,
      error: '',
      updatedAt: new Date('2026-08-03T12:00:00Z'),
      changedClaimIds: [] as string[],
    });
    const operational = jasmine.createSpyObj<OperationalDataStore>('OperationalDataStore', ['activateDashboard', 'refresh']);
    operational.activateDashboard.and.returnValue(() => undefined);
    Object.assign(operational, { dashboard: resource.asReadonly() });

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'dashboard', component: DashboardPageComponent }]),
        { provide: ClaimsApiService, useValue: claims },
        { provide: OperationalDataStore, useValue: operational },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard?claimId=claim-demo', DashboardPageComponent);
    harness.detectChanges();

    expect(operational.activateDashboard).toHaveBeenCalled();
    expect(claims.get).toHaveBeenCalledWith('claim-demo');
    expect(harness.routeNativeElement?.querySelector('[data-tour-target="manager-golden-journey"]')).not.toBeNull();
    expect(harness.routeNativeElement?.textContent).toContain('CLM-2026-DEMO');
    expect(harness.routeNativeElement?.textContent).toContain('64% of all claims open');
    expect(harness.routeNativeElement?.textContent).toContain('78%');
    expect(harness.routeNativeElement?.querySelector('[data-tour-target="priority-command"]')).not.toBeNull();
    expect(harness.routeNativeElement?.querySelectorAll('.instrument-cell').length).toBe(4);
    expect(harness.routeNativeElement?.textContent).toContain('Intervention queue');
    expect(harness.routeNativeElement?.textContent).toContain('Team capacity');
    expect(harness.routeNativeElement?.textContent).toContain('Claims Intake');
    expect(harness.routeNativeElement?.textContent).toContain('Operational event feed');
  });
});
