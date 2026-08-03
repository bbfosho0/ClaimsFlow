import { ClaimFilters, DEFAULT_FILTERS, parseClaimFilters, serializeClaimFilters } from './claim-filter-codec';

describe('claim filter codec', () => {
  it('round trips every curated non-default filter', () => {
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
    expect(parseClaimFilters(serializeClaimFilters(filters))).toEqual(filters);
  });

  it('round trips adjuster selection independently of team selection', () => {
    const filters: ClaimFilters = {
      ...DEFAULT_FILTERS,
      adjusterId: '00000000-0000-0000-0000-000000000004',
    };
    expect(parseClaimFilters(serializeClaimFilters(filters))).toEqual(filters);
  });

  it('clamps invalid pagination values and rejects unknown enums', () => {
    const parsed = parseClaimFilters({
      page: -4,
      size: 1000,
      claimType: 'NOT_A_TYPE',
      priority: 'NOT_A_PRIORITY',
      status: 'NOT_A_STATUS',
      region: 'NOT_A_REGION',
    });
    expect(parsed.page).toBe(0);
    expect(parsed.size).toBe(100);
    expect(parsed.claimType).toBe('');
    expect(parsed.priority).toBe('');
    expect(parsed.status).toBe('');
    expect(parsed.region).toBe('');
  });
});
