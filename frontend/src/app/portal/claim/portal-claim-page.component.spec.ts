import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '../../core/api/api-error';
import { PortalApiService } from '../data-access/portal-api.service';
import { PortalClaim } from '../models/portal.models';
import { PortalClaimPageComponent } from './portal-claim-page.component';

const claim: PortalClaim = {
  claimId: 'claim-1',
  claimNumber: 'CLM-2026-DEMO01',
  claimantName: 'Taylor Reed',
  claimType: 'PROPERTY',
  status: 'NEW',
  completenessPercentage: 50,
  slaDeadline: '2026-08-10T12:00:00Z',
  evidence: { incidentReportPresent: true, photosPresent: false, proofOfOwnershipPresent: false, medicalDocumentationPresent: false },
  timeline: [{ actionType: 'CLAIM_CREATED', summary: 'Claim created and triaged', occurredAt: '2026-08-02T12:00:00Z' }],
  nextAction: 'Add the requested evidence to keep your claim moving.',
};

describe('PortalClaimPageComponent', () => {
  const api = jasmine.createSpyObj<PortalApiService>('PortalApiService', ['getClaim']);

  beforeEach(async () => {
    api.getClaim.calls.reset();
    await TestBed.configureTestingModule({
      imports: [PortalClaimPageComponent],
      providers: [
        provideRouter([]),
        { provide: PortalApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'claim-1' }) } } },
      ],
    }).compileComponents();
  });

  it('shows a stable loading state before the request completes', () => {
    api.getClaim.and.returnValue(new Subject<PortalClaim>());
    const fixture = TestBed.createComponent(PortalClaimPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading your claim');
  });

  it('renders claimant-safe status, next action, and timeline', () => {
    api.getClaim.and.returnValue(of(claim));
    const fixture = TestBed.createComponent(PortalClaimPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('CLM-2026-DEMO01');
    expect(fixture.nativeElement.textContent).toContain('50%');
    expect(fixture.nativeElement.textContent).toContain('Add the requested evidence');
    expect(fixture.nativeElement.textContent).toContain('Claim submitted');
    expect(fixture.nativeElement.textContent).not.toContain('priority rationale');
  });

  it('shows a retryable error state', () => {
    api.getClaim.and.returnValue(throwError(() => new ApiError(500, 'INTERNAL_ERROR', 'The claim service is unavailable.')));
    const fixture = TestBed.createComponent(PortalClaimPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('We could not load this claim');
    expect(fixture.nativeElement.textContent).toContain('The claim service is unavailable.');
    expect(fixture.nativeElement.textContent).toContain('Try again');
  });
});
