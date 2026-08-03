import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ClaimsApiService } from './claims-api.service';
import { ClaimFilters } from './claim-filter-codec';

describe('ClaimsApiService', () => {
  let service: ClaimsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ClaimsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('constructs claim-list query parameters from filters', () => {
    const filters: ClaimFilters = {
      q: 'CLM-2026',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      assignment: 'unassigned',
      page: 2,
      size: 20,
      sort: 'slaDeadline,asc',
    };

    service.list(filters).subscribe();

    const request = http.expectOne(candidate => candidate.url === '/api/claims');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('q')).toBe('CLM-2026');
    expect(request.request.params.get('status')).toBe('UNDER_REVIEW');
    expect(request.request.params.get('priority')).toBe('HIGH');
    expect(request.request.params.get('assignment')).toBe('unassigned');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('sort')).toBe('slaDeadline,asc');
    request.flush({ content: [], page: 2, size: 20, totalElements: 0, totalPages: 0 });
  });

  it('posts a bounded claimant-visible message to the exact claim endpoint', () => {
    const body = {
      author: 'Jordan Lee',
      audience: 'CLAIMANT' as const,
      body: 'Please add clear photos of the rear bumper and trunk damage.',
    };

    service.addMessage('claim-123', body).subscribe(message => {
      expect(message.author).toBe('Jordan Lee');
    });

    const request = http.expectOne('/api/claims/claim-123/messages');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({
      id: 'message-1',
      author: 'Jordan Lee',
      body: body.body,
      createdAt: '2026-08-03T06:00:00Z',
    });
  });
});
