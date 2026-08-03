import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OperationalDataStore } from '../../core/operational-data/operational-data.store';
import { ClaimsApiService } from './claims-api.service';
import { ClaimFilters, DEFAULT_FILTERS } from './claim-filter-codec';

describe('ClaimsApiService', () => {
  let service: ClaimsApiService;
  let http: HttpTestingController;
  let operational: jasmine.SpyObj<OperationalDataStore>;

  beforeEach(() => {
    operational = jasmine.createSpyObj<OperationalDataStore>('OperationalDataStore', ['invalidate']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OperationalDataStore, useValue: operational },
      ],
    });
    service = TestBed.inject(ClaimsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('constructs claim-list query parameters from every curated filter', () => {
    const filters: ClaimFilters = {
      ...DEFAULT_FILTERS,
      q: 'CLM-2026',
      from: '2026-07-03',
      to: '2026-08-01',
      claimType: 'PROPERTY',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      assignment: 'unassigned',
      team: 'Claims Operations',
      region: 'SOUTHEAST',
      page: 2,
      sort: 'slaDeadline,asc',
    };

    service.list(filters).subscribe();

    const request = http.expectOne(candidate => candidate.url === '/api/claims');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('q')).toBe('CLM-2026');
    expect(request.request.params.get('from')).toBe('2026-07-03');
    expect(request.request.params.get('to')).toBe('2026-08-01');
    expect(request.request.params.get('claimType')).toBe('PROPERTY');
    expect(request.request.params.get('status')).toBe('UNDER_REVIEW');
    expect(request.request.params.get('priority')).toBe('HIGH');
    expect(request.request.params.get('assignment')).toBe('unassigned');
    expect(request.request.params.get('team')).toBe('Claims Operations');
    expect(request.request.params.get('region')).toBe('SOUTHEAST');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('sort')).toBe('slaDeadline,asc');
    request.flush({ content: [], page: 2, size: 20, totalElements: 0, totalPages: 0 });
  });

  it('invalidates every operational family after a successful status mutation', () => {
    service.updateStatus('claim-123', 'UNDER_REVIEW', 'Jordan Lee').subscribe();

    const request = http.expectOne('/api/claims/claim-123/status');
    expect(request.request.method).toBe('PATCH');
    request.flush({ id: 'claim-123' });

    expect(operational.invalidate).toHaveBeenCalledWith(
      ['dashboard', 'queue', 'myWork', 'analytics', 'team', 'evidence'],
      ['claim-123'],
    );
  });

  it('posts a bounded claimant-visible message and invalidates Evidence Operations and My Work', () => {
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
      audience: 'CLAIMANT',
      body: body.body,
      createdAt: '2026-08-03T06:00:00Z',
    });

    expect(operational.invalidate).toHaveBeenCalledWith(['evidence', 'myWork'], ['claim-123']);
  });
});
