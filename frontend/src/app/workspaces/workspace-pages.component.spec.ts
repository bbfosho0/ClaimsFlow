import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { ClaimDetail } from '../shared/models/claim.models';
import {
  AnalyticsPageComponent,
  DocumentsPageComponent,
  TeamOperationsPageComponent,
  WorkflowsPageComponent,
} from './workspace-pages.component';

const demoClaim: ClaimDetail = {
  id: 'claim-demo',
  claimNumber: 'CLM-2026-DEMO',
  claimantName: 'Taylor Reed',
  claimantEmail: 'taylor.reed@example.com',
  claimType: 'PROPERTY',
  incidentDate: '2026-08-02',
  estimatedLoss: 18750,
  description: 'Property damage demo claim.',
  evidence: { incidentReportPresent: true, photosPresent: false, proofOfOwnershipPresent: false, medicalDocumentationPresent: false },
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

describe('Midnight Command workspaces', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('updates the analytics comparison window deterministically', async () => {
    await TestBed.configureTestingModule({ imports: [AnalyticsPageComponent] }).compileComponents();
    const fixture = TestBed.createComponent(AnalyticsPageComponent);
    fixture.detectChanges();

    fixture.componentInstance.setRange('Quarter to date');
    fixture.detectChanges();

    expect(fixture.componentInstance.range()).toBe('Quarter to date');
    expect(fixture.nativeElement.textContent).toContain('$12.86M');
  });

  it('selects a document and exposes the approved extraction workspace', async () => {
    await TestBed.configureTestingModule({ imports: [DocumentsPageComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DocumentsPageComponent);
    fixture.detectChanges();

    fixture.componentInstance.selectDocument('Police Report.pdf');
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedDocument().name).toBe('Police Report.pdf');
    expect(fixture.nativeElement.textContent).toContain('OCR & Extraction Tags');
    expect(fixture.nativeElement.textContent).toContain('Confidence Score');
  });

  it('filters team operations by squad', async () => {
    await TestBed.configureTestingModule({ imports: [TeamOperationsPageComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TeamOperationsPageComponent);
    fixture.detectChanges();

    fixture.componentInstance.setTeam('Property Response');
    fixture.detectChanges();

    expect(fixture.componentInstance.team()).toBe('Property Response');
    expect(fixture.nativeElement.textContent).toContain('Property Response');
  });

  it('runs a local workflow simulation without implying server persistence', async () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['get']);
    await TestBed.configureTestingModule({
      imports: [WorkflowsPageComponent],
      providers: [provideRouter([]), { provide: ClaimsApiService, useValue: api }],
    }).compileComponents();
    const fixture = TestBed.createComponent(WorkflowsPageComponent);
    fixture.detectChanges();

    fixture.componentInstance.runSimulation();
    fixture.detectChanges();

    expect(fixture.componentInstance.simulationState()).toBe('passed');
    expect(fixture.nativeElement.textContent).toContain('Local simulation passed');
    expect(fixture.nativeElement.textContent).toContain('Production workflow activation is not connected');
    expect((fixture.nativeElement.querySelector('button.primary') as HTMLButtonElement).disabled).toBeTrue();
  });

  it('loads the real reserved claim through the manual session-storage control', async () => {
    sessionStorage.setItem('claimsflow.demoClaimId', 'claim-demo');
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['get']);
    api.get.and.returnValue(of(demoClaim));
    await TestBed.configureTestingModule({
      imports: [WorkflowsPageComponent],
      providers: [provideRouter([]), { provide: ClaimsApiService, useValue: api }],
    }).compileComponents();
    const fixture = TestBed.createComponent(WorkflowsPageComponent);
    fixture.detectChanges();

    fixture.componentInstance.loadDemoClaim();
    fixture.detectChanges();

    expect(api.get).toHaveBeenCalledWith('claim-demo');
    expect(fixture.componentInstance.simulationInput()).toEqual({
      claimType: 'PROPERTY',
      estimatedLoss: 18750,
      completenessPercentage: 50,
      priority: 'HIGH',
      status: 'UNDER_REVIEW',
    });
    expect(fixture.nativeElement.textContent).toContain('CLM-2026-DEMO');
    expect(fixture.nativeElement.textContent).toContain('no server mutation');
  });

  it('automatically loads the claimId supplied by a shareable administrator tour URL', async () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['get']);
    api.get.and.returnValue(of(demoClaim));
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'workflows', component: WorkflowsPageComponent }]),
        { provide: ClaimsApiService, useValue: api },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/workflows?claimId=claim-demo', WorkflowsPageComponent);
    harness.detectChanges();

    expect(api.get).toHaveBeenCalledWith('claim-demo');
    expect(component.simulationState()).toBe('passed');
    expect(harness.routeNativeElement?.textContent).toContain('CLM-2026-DEMO');
  });
});
