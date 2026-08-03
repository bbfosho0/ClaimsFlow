import {
  operationalFilterKey,
  parseOperationalFilters,
  serializeOperationalFilters,
} from './operational-filter-codec';
import { DEFAULT_OPERATIONAL_FILTERS } from './operational-data.models';

describe('operational filter codec', () => {
  it('drops invalid values and preserves allowed filters', () => {
    expect(parseOperationalFilters({
      from: '2026-07-01',
      to: '2026-07-31',
      claimType: 'AUTO',
      priority: 'IMPOSSIBLE',
      status: 'UNDER_REVIEW',
      adjusterId: 'adjuster-1',
      team: 'SIU Investigations',
      region: 'WEST',
    })).toEqual({
      from: '2026-07-01',
      to: '2026-07-31',
      claimType: 'AUTO',
      priority: '',
      status: 'UNDER_REVIEW',
      adjusterId: 'adjuster-1',
      team: 'SIU Investigations',
      region: 'WEST',
    });
  });

  it('ignores non-string route values', () => {
    expect(parseOperationalFilters({
      from: ['2026-07-01'],
      team: { value: 'SIU' },
      region: 42,
    })).toEqual(DEFAULT_OPERATIONAL_FILTERS);
  });

  it('serializes only active filters', () => {
    expect(serializeOperationalFilters({
      ...DEFAULT_OPERATIONAL_FILTERS,
      priority: 'CRITICAL',
      team: 'Complex Claims',
    })).toEqual({
      priority: 'CRITICAL',
      team: 'Complex Claims',
    });
  });

  it('round trips every supported enum', () => {
    const filters = {
      from: '2026-06-01',
      to: '2026-08-01',
      claimType: 'PROPERTY' as const,
      priority: 'HIGH' as const,
      status: 'WAITING_FOR_INFORMATION' as const,
      adjusterId: '00000000-0000-0000-0000-000000000001',
      team: 'Property Response',
      region: 'SOUTHEAST' as const,
    };

    expect(parseOperationalFilters(serializeOperationalFilters(filters))).toEqual(filters);
  });

  it('creates a stable ordered equality key', () => {
    const first = parseOperationalFilters({ region: 'WEST', team: 'SIU' });
    const second = parseOperationalFilters({ team: 'SIU', region: 'WEST' });

    expect(operationalFilterKey(first)).toBe(
      'from=&to=&claimType=&priority=&status=&adjusterId=&team=SIU&region=WEST',
    );
    expect(operationalFilterKey(second)).toBe(operationalFilterKey(first));
  });
});
