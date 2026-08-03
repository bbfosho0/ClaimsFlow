import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '../../core/api/api-error';
import { PortalApiService } from '../data-access/portal-api.service';
import { PortalClaim } from '../models/portal.models';
import { PortalDocumentsPageComponent } from './portal-documents-page.component';

const baseClaim: PortalClaim = {
  claimId: 'claim-1',
  claimNumber: 'CLM-2026-DEMO01',
  claimantName: 'Taylor Reed',
  claimType: 'PROPERTY',
  status: 'NEW',
  completenessPercentage: 50,
  slaDeadline: '2026-08-10T12:00:00Z',
  evidence: { incidentReportPresent: true, photosPresent: false, proofOfOwnershipPresent: false, medicalDocumentationPresent: false },
  timeline: [],
  nextAction: 'Add the requested evidence to keep your claim moving.',
};

describe('PortalDocumentsPageComponent', () => {
  const api = jasmine.createSpyObj<PortalApiService>('PortalApiService', ['getClaim', 'updateEvidence']);

  beforeEach(async () => {
    api.getClaim.calls.reset();
    api.updateEvidence.calls.reset();
    await TestBed.configureTestingModule({
      imports: [PortalDocumentsPageComponent],
      providers: [
        provideRouter([]),
        { provide: PortalApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'claim-1' }) } } },
      ],
    }).compileComponents();
  });

  it('renders a stable loading state', () => {
    api.getClaim.and.returnValue(new Subject<PortalClaim>());
    const fixture = TestBed.createComponent(PortalDocumentsPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading evidence status');
  });

  it('renders a retryable load error', () => {
    api.getClaim.and.returnValue(throwError(() => new ApiError(500, 'INTERNAL_ERROR', 'Evidence status is unavailable.')));
    const fixture = TestBed.createComponent(PortalDocumentsPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Evidence could not be loaded');
    expect(fixture.nativeElement.textContent).toContain('Evidence status is unavailable.');
    expect(fixture.nativeElement.textContent).toContain('Try again');
  });

  it('shows recorded and missing evidence with honest copy', () => {
    api.getClaim.and.returnValue(of(baseClaim));
    const fixture = TestBed.createComponent(PortalDocumentsPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Recorded for this demo');
    expect(fixture.nativeElement.textContent).toContain('Add evidence');
    expect(fixture.nativeElement.textContent).toContain('does not claim permanent binary file storage');
  });

  it('records photos, refreshes completeness, and announces success', () => {
    api.getClaim.and.returnValue(of(baseClaim));
    api.updateEvidence.and.returnValue(of({
      ...baseClaim,
      completenessPercentage: 75,
      evidence: { ...baseClaim.evidence, photosPresent: true },
    }));
    const fixture = TestBed.createComponent(PortalDocumentsPageComponent);
    fixture.detectChanges();

    const photos = fixture.componentInstance.evidence().find(item => item.kind === 'PHOTOS')!;
    fixture.componentInstance.addEvidence(photos);
    fixture.detectChanges();

    expect(api.updateEvidence).toHaveBeenCalledOnceWith('claim-1', 'PHOTOS', true);
    expect(fixture.nativeElement.textContent).toContain('Photos added to the claim.');
    expect(fixture.nativeElement.textContent).toContain('75%');
  });

  it('keeps the page open when an evidence update fails', () => {
    api.getClaim.and.returnValue(of(baseClaim));
    api.updateEvidence.and.returnValue(throwError(() => new ApiError(500, 'INTERNAL_ERROR', 'Evidence could not be recorded.')));
    const fixture = TestBed.createComponent(PortalDocumentsPageComponent);
    fixture.detectChanges();

    const photos = fixture.componentInstance.evidence().find(item => item.kind === 'PHOTOS')!;
    fixture.componentInstance.addEvidence(photos);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Evidence could not be recorded.');
    expect(fixture.componentInstance.claim()).toEqual(baseClaim);
  });
});
