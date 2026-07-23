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
});
