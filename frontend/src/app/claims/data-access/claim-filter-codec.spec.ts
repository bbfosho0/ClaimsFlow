import { parseClaimFilters, serializeClaimFilters } from './claim-filter-codec';

describe('claim filter codec', () => {
  it('round trips non-default filters', () => {
    const filters = { q: 'CLM-2026', status: 'UNDER_REVIEW' as const, priority: 'HIGH' as const, assignment: 'unassigned', page: 2, size: 20, sort: 'slaDeadline,asc' };
    expect(parseClaimFilters(serializeClaimFilters(filters))).toEqual(filters);
  });

  it('clamps invalid pagination values', () => {
    expect(parseClaimFilters({ page: -4, size: 1000 }).page).toBe(0);
    expect(parseClaimFilters({ page: -4, size: 1000 }).size).toBe(100);
  });
});
