import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { AnalyticsSnapshot, EvidenceOperationsSnapshot, OperationalResource, TeamOperationsSnapshot } from '../core/operational-data/operational-data.models';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { AnalyticsPageComponent, DocumentsPageComponent, TeamOperationsPageComponent, WorkflowsPageComponent } from './workspace-pages.component';

const options = { claimTypes: ['AUTO', 'PROPERTY', 'PERSONAL_INJURY'] as const, priorities: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const, statuses: ['NEW', 'UNDER_REVIEW', 'WAITING_FOR_INFORMATION', 'READY_FOR_DECISION', 'RESOLVED', 'CLOSED'] as const, regions: ['NORTHEAST', 'SOUTHEAST', 'MIDWEST', 'SOUTHWEST', 'WEST'] as const, teams: ['Claims Operations'], adjusters: [{ id: 'adjuster-demo', displayName: 'Jordan Lee', team: 'Claims Operations' }] };
const analytics: AnalyticsSnapshot = {
  generatedAt: '2026-08-03T12:00:00Z', options,
  kpis: { estimatedExposure: 125000, totalClaims: 12, openClaims: 8, resolvedClaims: 4, averageResolutionHours: 40, evidenceReadinessPercentage: 78, slaCompliancePercentage: 92 },
  comparison: { previousFrom: '2026-06-04', previousTo: '2026-07-03', previousTotalClaims: 10, previousEstimatedExposure: 100000, previousAverageResolutionHours: 44, claimVolumeChange: { kind: 'PERCENTAGE', percentage: 20 }, exposureChange: { kind: 'PERCENTAGE', percentage: 25 }, resolutionTimeChange: { kind: 'PERCENTAGE', percentage: -9.1 } },
  claimVolume: [{ date: '2026-08-02', count: 4 }, { date: '2026-08-03', count: 8 }], resolvedVolume: [{ date: '2026-08-02', count: 1 }, { date: '2026-08-03', count: 3 }],
  statusDistribution: [{ key: 'NEW', label: 'New', count: 12, percentage: 100 }], priorityDistribution: [{ key: 'HIGH', label: 'High', count: 12, percentage: 100 }], regionDistribution: [{ key: 'SOUTHEAST', label: 'Southeast', count: 12, percentage: 100 }], agingBands: [{ key: '0_2', label: '0–2 days', count: 8, percentage: 100 }], cohorts: [{ weekStart: '2026-07-27', totalClaims: 12, resolvedWithin7DaysPercentage: 25, resolvedWithin14DaysPercentage: 33, resolvedWithin30DaysPercentage: 33 }],
};
const team: TeamOperationsSnapshot = {
  generatedAt: '2026-08-03T12:00:00Z', options,
  kpis: { activeClaims: 8, atRiskClaims: 2, overdueClaims: 1, slaCompliancePercentage: 92, evidenceReadinessPercentage: 78, assignmentCoveragePercentage: 88, overallUtilizationPercentage: 67 },
  teams: [{ name: 'Claims Operations', activeClaims: 8, capacity: 12, utilizationPercentage: 67, evidenceReadinessPercentage: 78, slaCompliancePercentage: 92 }],
  adjusters: [{ adjusterId: 'adjuster-demo', displayName: 'Jordan Lee', team: 'Claims Operations', activeClaims: 8, capacity: 12, utilizationPercentage: 67 }],
  escalations: [{ claimId: 'claim-demo', claimNumber: 'CLM-2026-DEMO', claimantName: 'Taylor Reed', priority: 'HIGH', status: 'UNDER_REVIEW', slaDeadline: '2026-08-03T18:00:00Z', reason: 'SLA due within 24 hours', tone: 'warning' }],
  advisories: [{ title: 'SLA pressure', detail: '2 claims enter deadline risk.', route: '/app/claims', queryParams: { sort: 'slaDeadline,asc' }, tone: 'warning' }], integrity: { overall: 87, slaCompliance: 92, evidenceReadiness: 78, assignmentCoverage: 88, label: 'Healthy' },
};
const evidence: EvidenceOperationsSnapshot = {
  generatedAt: '2026-08-03T12:00:00Z', options,
  claims: [{ id: 'claim-demo', claimNumber: 'CLM-2026-DEMO', claimantName: 'Taylor Reed', claimType: 'PROPERTY', status: 'UNDER_REVIEW', priority: 'HIGH', region: 'SOUTHEAST', completenessPercentage: 50, slaDeadline: '2026-08-03T18:00:00Z', adjusterName: 'Jordan Lee', team: 'Claims Operations', evidence: [{ kind: 'INCIDENT_REPORT', label: 'Incident report', present: true, state: 'Received' }] }],
  selected: { id: 'claim-demo', claimNumber: 'CLM-2026-DEMO', claimantName: 'Taylor Reed', claimantEmail: 'taylor.reed@example.com', claimType: 'PROPERTY', status: 'UNDER_REVIEW', priority: 'HIGH', region: 'SOUTHEAST', completenessPercentage: 50, slaDeadline: '2026-08-03T18:00:00Z', adjusterName: 'Jordan Lee', team: 'Claims Operations', estimatedLoss: 18750, createdAt: '2026-08-03T05:00:00Z', evidence: [{ kind: 'INCIDENT_REPORT', label: 'Incident report', present: true, state: 'Received' }], claimantMessages: [{ id: 'message-1', author: 'Jordan Lee', audience: 'CLAIMANT', body: 'Please add photos.', createdAt: '2026-08-03T06:00:00Z' }] },
};
function resource<T>(value: T): OperationalResource<T> { return { value, loading: false, refreshing: false, stale: false, error: '', updatedAt: new Date('2026-08-03T12:00:00Z'), changedClaimIds: [] }; }
function store(): any { const value = jasmine.createSpyObj<OperationalDataStore>('OperationalDataStore', ['activateAnalytics', 'activateTeam', 'activateEvidence', 'refresh']); value.activateAnalytics.and.returnValue(() => undefined); value.activateTeam.and.returnValue(() => undefined); value.activateEvidence.and.returnValue(() => undefined); return Object.assign(value, { analytics: signal(resource(analytics)).asReadonly(), team: signal(resource(team)).asReadonly(), evidence: signal(resource(evidence)).asReadonly() }); }

describe('Deployment-truthful workspaces', () => {
  it('renders backend analytics with finite comparison labels', async () => {
    await TestBed.configureTestingModule({ imports: [AnalyticsPageComponent], providers: [provideRouter([]), { provide: OperationalDataStore, useValue: store() }] }).compileComponents();
    const fixture = TestBed.createComponent(AnalyticsPageComponent); fixture.detectChanges(); const text = fixture.nativeElement.textContent;
    expect(text).toContain('Estimated exposure'); expect(text).toContain('SLA compliance'); expect(text).toContain('+20% vs prior period'); expect(text).not.toContain('NaN'); expect(text).not.toContain('Infinity'); expect(fixture.nativeElement.querySelectorAll('[data-chart-summary]').length).toBeGreaterThan(0);
  });

  it('renders team integrity components and navigational advisories without mutation controls', async () => {
    await TestBed.configureTestingModule({ imports: [TeamOperationsPageComponent], providers: [provideRouter([]), { provide: OperationalDataStore, useValue: store() }] }).compileComponents();
    const fixture = TestBed.createComponent(TeamOperationsPageComponent); fixture.detectChanges(); const text = fixture.nativeElement.textContent;
    expect(text).toContain('SLA pressure'); expect(text).toContain('Integrity components'); expect(text).not.toContain('Apply');
  });

  it('renders persisted evidence without unsupported file-management claims', async () => {
    await TestBed.configureTestingModule({ imports: [DocumentsPageComponent], providers: [provideRouter([]), { provide: OperationalDataStore, useValue: store() }] }).compileComponents();
    const fixture = TestBed.createComponent(DocumentsPageComponent); fixture.detectChanges(); const text = fixture.nativeElement.textContent;
    expect(text).toContain('Evidence completeness matrix'); expect(text).toContain('Claimant-visible messages'); ['OCR', 'Storage used', 'Bulk Actions', 'Upload Documents', 'SMS'].forEach(label => expect(text).not.toContain(label));
  });

  it('runs a local workflow simulation without implying server persistence', async () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['get']);
    await TestBed.configureTestingModule({ imports: [WorkflowsPageComponent], providers: [provideRouter([]), { provide: ClaimsApiService, useValue: api }] }).compileComponents();
    const fixture = TestBed.createComponent(WorkflowsPageComponent); fixture.detectChanges(); fixture.componentInstance.runSimulation(); fixture.detectChanges();
    expect(fixture.componentInstance.simulationState()).toBe('passed'); expect(fixture.nativeElement.textContent).toContain('Production workflow activation is not connected'); expect((fixture.nativeElement.querySelector('button.primary') as HTMLButtonElement).disabled).toBeTrue();
  });
});
