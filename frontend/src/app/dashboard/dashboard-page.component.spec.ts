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
  estimatedExposure: 875000,
  overallUtilizationPercentage: 42,
  resolvedThisPeriod: 4,
  comparison: {
    previousAsOf: '2026-07-04',
    openClaims: { kind: 'PERCENTAGE', percentage: 8.2 },
    estimatedExposure: { kind: 'PERCENTAGE', percentage: 5.4 },
    slaPressure: { kind: 'CLEARED', percentage: null },
    evidenceReadiness: { kind: 'PERCENTAGE', percentage: 3.1 },
  },
  openPortfolioTrend: [{ date: '2026-08-02', value: 6 }, { date: '2026-08-03', value: 7 }],
  createdTrend: [{ date: '2026-08-02', value: 2 }, { date: '2026-08-03', value: 1 }],
  resolvedTrend: [{ date: '2026-08-02', value: 1 }, { date: '2026-08-03', value: 2 }],
  exposureTrend: [{ date: '2026-08-02', amount: 820000 }, { date: '2026-08-03', amount: 875000 }],
  slaPressureTrend: [{ date: '2026-08-02', atRisk: 1, overdue: 1 }, { date: '2026-08-03', atRisk: 2, overdue: 1 }],
  evidenceReadinessBands: [
    { key: '0_49', label: '0–49%', count: 1, percentage: 14 },
    { key: '50_74', label: '50–74%', count: 2, percentage: 29 },
    { key: '75_99', label: '75–99%', count: 2, percentage: 29 },
    { key: 'COMPLETE', label: '100% complete', count: 2, percentage: 29 },
  ],
  priorityDistribution: [
    { key: 'LOW', label: 'Low', count: 1, percentage: 14 },
    { key: 'MEDIUM', label: 'Medium', count: 3, percentage: 43 },
    { key: 'HIGH', label: 'High', count: 2, percentage: 29 },
    { key: 'CRITICAL', label: 'Critical', count: 1, percentage: 14 },
  ],
  slaDeadlineBands: [
    { key: 'OVERDUE', label: 'Overdue', count: 1, percentage: 14 },
    { key: 'DUE_24H', label: 'Due <24h', count: 2, percentage: 29 },
    { key: 'DUE_1_3D', label: 'Due 1–3d', count: 1, percentage: 14 },
    { key: 'DUE_4_7D', label: 'Due 4–7d', count: 1, percentage: 14 },
    { key: 'DUE_LATER', label: 'Due >7d', count: 2, percentage: 29 },
  ],
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

  it('renders the Midnight Violet operational hierarchy from backend data', async () => {
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

    const root = harness.routeNativeElement!;
    expect(operational.activateDashboard).toHaveBeenCalled();
    expect(claims.get).toHaveBeenCalledWith('claim-demo');
    expect(root.querySelector('[data-tour-target="manager-golden-journey"]')).not.toBeNull();
    expect(root.textContent).toContain('CLM-2026-DEMO');
    expect(root.querySelectorAll('app-metric-card').length).toBe(4);
    expect(root.textContent).toContain('Open claims');
    expect(root.textContent).toContain('Estimated exposure');
    expect(root.textContent).toContain('SLA pressure');
    expect(root.textContent).toContain('Evidence readiness');
    expect(root.textContent).toContain('$875.0K');
    expect(root.textContent).toContain('2 due <24h · 1 overdue');
    expect(root.querySelector('app-line-area-chart')).not.toBeNull();
    expect(root.textContent).toContain('Portfolio pulse');
    expect(root.textContent).toContain('Intervention queue');
    expect(root.textContent).toContain('SLA deadline profile');
    expect(root.textContent).toContain('Team capacity');
    expect(root.textContent).toContain('Evidence readiness bands');
    expect(root.textContent).toContain('Priority mix');
    expect(root.textContent).toContain('Operational event feed');
    expect(root.querySelector('app-command-field')).toBeNull();
  });
});
