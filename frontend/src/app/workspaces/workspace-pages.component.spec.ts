import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import {
  AnalyticsSnapshot,
  EvidenceOperationsSnapshot,
  OperationalResource,
  TeamOperationsSnapshot,
} from '../core/operational-data/operational-data.models';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { ClaimDetail } from '../shared/models/claim.models';
import {
  AnalyticsPageComponent,
  DocumentsPageComponent,
  TeamOperationsPageComponent,
  WorkflowsPageComponent,
} from './workspace-pages.component';

const options = {
  claimTypes: ['AUTO', 'PROPERTY', 'PERSONAL_INJURY'] as const,
  priorities: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const,
  statuses: ['NEW', 'UNDER_REVIEW', 'WAITING_FOR_INFORMATION', 'READY_FOR_DECISION', 'RESOLVED', 'CLOSED'] as const,
  regions: ['NORTHEAST', 'SOUTHEAST', 'MIDWEST', 'SOUTHWEST', 'WEST'] as const,
  teams: ['Claims Operations'],
  adjusters: [{ id: 'adjuster-demo', displayName: 'Jordan Lee', team: 'Claims Operations' }],
};

const analytics: AnalyticsSnapshot = {
  generatedAt: '2026-08-03T12:00:00Z',
  options,
  kpis: {
    estimatedExposure: 125000,
    totalClaims: 12,
    openClaims: 8,
    resolvedClaims: 4,
    averageResolutionHours: 40,
    evidenceReadinessPercentage: 78,
    slaCompliancePercentage: 92,
  },
  comparison: {
    previousFrom: '2026-06-04', previousTo: '2026-07-03',
    previousTotalClaims: 10, previousEstimatedExposure: 100000,
    previousAverageResolutionHours: 44, claimVolumeChangePercentage: 20,
    exposureChangePercentage: 25, resolutionTimeChangePercentage: -9.1,
  },
  claimVolume: [{ date: '2026-08-02', count: 4 }, { date: '2026-08-03', count: 8 }],
  resolvedVolume: [{ date: '2026-08-02', count: 1 }, { date: '2026-08-03', count: 3 }],
  statusDistribution: [{ key: 'NEW', label: 'New', count: 12, percentage: 100 }],
  priorityDistribution: [{ key: 'HIGH', label: 'High', count: 12, percentage: 100 }],
  regionDistribution: [{ key: 'SOUTHEAST', label: 'Southeast', count: 12, percentage: 100 }],
  agingBands: [{ key: '0_2', label: '0–2 days', count: 8, percentage: 100 }],
  cohorts: [{ weekStart: '2026-07-27', totalClaims: 12, resolvedWithin7DaysPercentage: 25, resolvedWithin14DaysPercentage: 33, resolvedWithin30DaysPercentage: 33 }],
};

const team: TeamOperationsSnapshot = {
  generatedAt: '2026-08-03T12:00:00Z',
  options,
  kpis: { activeClaims: 8, atRiskClaims: 2, overdueClaims: 1, slaCompliancePercentage: 92, evidenceReadinessPercentage: 78, assignmentCoveragePercentage: 88, overallUtilizationPercentage: 67 },
  teams: [{ name: 'Claims Operations', activeClaims: 8, capacity: 12, utilizationPercentage: 67, evidenceReadinessPercentage: 78, slaCompliancePercentage: 92 }],
  adjusters: [{ adjusterId: 'adjuster-demo', displayName: 'Jordan Lee', team: 'Claims Operations', activeClaims: 8, capacity: 12, utilizationPercentage: 67 }],
  escalations: [{ claimId: 'claim-demo', claimNumber: 'CLM-2026-DEMO', claimantName: 'Taylor Reed', priority: 'HIGH', status: 'UNDER_REVIEW', slaDeadline: '2026-08-03T18:00:00Z', reason: 'SLA due within 24 hours', tone: 'warning' }],
  advisories: [{ title: 'SLA pressure', detail: '2 claims enter deadline risk.', route: '/app/claims', queryParams: { sort: 'slaDeadline,asc' }, tone: 'warning' }],
  integrity: { overall: 87, slaCompliance: 92, evidenceReadiness: 78, assignmentCoverage: 88, label: 'Healthy' },
};

const evidence: EvidenceOperationsSnapshot = {
  generatedAt: '2026-08-03T12:00:00Z',
  options,
  claims: [{ id: 'claim-demo', claimNumber: 'CLM-2026-DEMO', claimantName: 'Taylor Reed', claimType: 'PROPERTY', status: 'UNDER_REVIEW', priority: 'HIGH', region: 'SOUTHEAST', completenessPercentage: 50, slaDeadline: '2026-08-03T18:00:00Z', adjusterName: 'Jordan Lee', team: 'Claims Operations' }],
  selected: {
    id: 'claim-demo', claimNumber: 'CLM-2026-DEMO', claimantName: 'Taylor Reed', claimantEmail: 'taylor.reed@example.com', claimType: 'PROPERTY', status: 'UNDER_REVIEW', priority: 'HIGH', region: 'SOUTHEAST', completenessPercentage: 50, slaDeadline: '2026-08-03T18:00:00Z', adjusterName: 'Jordan Lee', team: 'Claims Operations', estimatedLoss: 18750, createdAt: '2026-08-03T05:00:00Z',
    evidence: [{ kind: 'INCIDENT_REPORT', label: 'Incident report', present: true, state: 'Received' }, { kind: 'PHOTOS', label: 'Photos', present: false, state: 'Outstanding' }],
    claimantMessages: [{ id: 'message-1', author: 'Jordan Lee', audience: 'CLAIMANT', body: 'Please add photos.', createdAt: '2026-08-03T06:00:00Z' }],
  },
};

const demoClaim: ClaimDetail = {
  id: 'claim-demo', claimNumber: 'CLM-2026-DEMO', claimantName: 'Taylor Reed', claimantEmail: 'taylor.reed@example.com', claimType: 'PROPERTY', incidentDate: '2026-08-02', estimatedLoss: 18750, description: 'Property damage demo claim.',
  evidence: { incidentReportPresent: true, photosPresent: false, proofOfOwnershipPresent: false, medicalDocumentationPresent: false }, completenessPercentage: 50, missingEvidence: ['Damage photos', 'Proof of ownership'], priority: 'HIGH', priorityFactors: ['Estimated loss exceeds threshold'], status: 'UNDER_REVIEW', allowedNextStatuses: ['WAITING_FOR_INFORMATION', 'READY_FOR_DECISION'], slaDeadline: '2026-08-03T18:00:00Z', createdAt: '2026-08-03T05:00:00Z', updatedAt: '2026-08-03T05:30:00Z', version: 1,
};

function resource<T>(value: T): OperationalResource<T> {
  return { value, loading: false, refreshing: false, stale: false, error: '', updatedAt: new Date('2026-08-03T12:00:00Z'), changedClaimIds: [] };
}

function operationalStore(): jasmine.SpyObj<OperationalDataStore> & Record<string, unknown> {
  const store = jasmine.createSpyObj<OperationalDataStore>('OperationalDataStore', ['activateAnalytics', 'activateTeam', 'activateEvidence', 'refresh']);
  store.activateAnalytics.and.returnValue(() => undefined);
  store.activateTeam.and.returnValue(() => undefined);
  store.activateEvidence.and.returnValue(() => undefined);
  return Object.assign(store, {
    analytics: signal(resource(analytics)).asReadonly(),
    team: signal(resource(team)).asReadonly(),
    evidence: signal(resource(evidence)).asReadonly(),
  });
}

describe('Deployment-truthful workspaces', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('renders backend analytics without unsupported payout or fraud claims', async () => {
    await TestBed.configureTestingModule({ imports: [AnalyticsPageComponent], providers: [provideRouter([]), { provide: OperationalDataStore, useValue: operationalStore() }] }).compileComponents();
    const fixture = TestBed.createComponent(AnalyticsPageComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Estimated exposure');
    expect(text).toContain('SLA compliance');
    expect(text).not.toContain('Fraud Savings');
    expect(text).not.toContain('Total Payouts');
    expect(fixture.nativeElement.querySelectorAll('[data-chart-summary]').length).toBeGreaterThan(0);
  });

  it('renders navigational team advisories without an Apply mutation', async () => {
    await TestBed.configureTestingModule({ imports: [TeamOperationsPageComponent], providers: [provideRouter([]), { provide: OperationalDataStore, useValue: operationalStore() }] }).compileComponents();
    const fixture = TestBed.createComponent(TeamOperationsPageComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('SLA pressure');
    expect(text).toContain('Operational integrity');
    expect(text).not.toContain('Apply');
  });

  it('renders persisted evidence without unsupported file-management claims', async () => {
    await TestBed.configureTestingModule({ imports: [DocumentsPageComponent], providers: [provideRouter([]), { provide: OperationalDataStore, useValue: operationalStore() }] }).compileComponents();
    const fixture = TestBed.createComponent(DocumentsPageComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Evidence categories');
    expect(text).toContain('Claimant-visible messages');
    ['OCR', 'Storage', 'Versions', 'Bulk Actions', 'Upload Documents', 'SMS'].forEach(label => expect(text).not.toContain(label));
  });

  it('runs a local workflow simulation without implying server persistence', async () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['get']);
    await TestBed.configureTestingModule({ imports: [WorkflowsPageComponent], providers: [provideRouter([]), { provide: ClaimsApiService, useValue: api }] }).compileComponents();
    const fixture = TestBed.createComponent(WorkflowsPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.runSimulation();
    fixture.detectChanges();
    expect(fixture.componentInstance.simulationState()).toBe('passed');
    expect(fixture.nativeElement.textContent).toContain('Production workflow activation is not connected');
    expect((fixture.nativeElement.querySelector('button.primary') as HTMLButtonElement).disabled).toBeTrue();
  });

  it('loads the real reserved claim through the manual session-storage control', async () => {
    sessionStorage.setItem('claimsflow.demoClaimId', 'claim-demo');
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['get']);
    api.get.and.returnValue(of(demoClaim));
    await TestBed.configureTestingModule({ imports: [WorkflowsPageComponent], providers: [provideRouter([]), { provide: ClaimsApiService, useValue: api }] }).compileComponents();
    const fixture = TestBed.createComponent(WorkflowsPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.loadDemoClaim();
    fixture.detectChanges();
    expect(api.get).toHaveBeenCalledWith('claim-demo');
    expect(fixture.nativeElement.textContent).toContain('CLM-2026-DEMO');
    expect(fixture.nativeElement.textContent).toContain('no server mutation');
  });

  it('automatically loads the claimId supplied by an administrator tour URL', async () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['get']);
    api.get.and.returnValue(of(demoClaim));
    await TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'workflows', component: WorkflowsPageComponent }]), { provide: ClaimsApiService, useValue: api }] }).compileComponents();
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/workflows?claimId=claim-demo', WorkflowsPageComponent);
    harness.detectChanges();
    expect(api.get).toHaveBeenCalledWith('claim-demo');
    expect(component.simulationState()).toBe('passed');
  });
});
