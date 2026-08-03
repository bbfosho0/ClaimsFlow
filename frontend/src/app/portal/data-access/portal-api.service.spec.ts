import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PortalClaim } from '../models/portal.models';
import { PortalApiService } from './portal-api.service';

const claim: PortalClaim = {
  claimId: 'claim-1',
  claimNumber: 'CLM-2026-DEMO01',
  claimantName: 'Taylor Reed',
  claimType: 'PROPERTY',
  status: 'NEW',
  completenessPercentage: 50,
  slaDeadline: '2026-08-10T12:00:00Z',
  evidence: {
    incidentReportPresent: true,
    photosPresent: false,
    proofOfOwnershipPresent: false,
    medicalDocumentationPresent: false,
  },
  timeline: [],
  nextAction: 'Add the requested evidence to keep your claim moving.',
};

describe('PortalApiService', () => {
  let service: PortalApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PortalApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reads the claimant-safe claim projection', () => {
    service.getClaim('claim-1').subscribe(value => expect(value).toEqual(claim));

    const request = http.expectOne('/api/portal/claims/claim-1');
    expect(request.request.method).toBe('GET');
    request.flush(claim);
  });

  it('updates one evidence kind with the exact bounded request', () => {
    service.updateEvidence('claim-1', 'PHOTOS', true).subscribe();

    const request = http.expectOne('/api/portal/claims/claim-1/evidence');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      kind: 'PHOTOS',
      present: true,
      actor: 'Taylor Reed',
    });
    request.flush(claim);
  });

  it('reads claimant-visible messages from the portal endpoint', () => {
    service.messages('claim-1').subscribe(messages => expect(messages.length).toBe(1));

    const request = http.expectOne('/api/portal/claims/claim-1/messages');
    expect(request.request.method).toBe('GET');
    request.flush([{
      id: 'message-1',
      author: 'Jordan Lee',
      body: 'Please upload photos.',
      createdAt: '2026-08-02T15:00:00Z',
    }]);
  });
});
