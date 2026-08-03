import {
  ClaimPriority,
  ClaimRegion,
  ClaimStatus,
  ClaimType,
} from '../../shared/models/claim.models';
import {
  DEFAULT_OPERATIONAL_FILTERS,
  OperationalFilters,
} from './operational-data.models';

const CLAIM_TYPES: readonly ClaimType[] = ['AUTO', 'PROPERTY', 'PERSONAL_INJURY'];
const PRIORITIES: readonly ClaimPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES: readonly ClaimStatus[] = [
  'NEW',
  'UNDER_REVIEW',
  'WAITING_FOR_INFORMATION',
  'READY_FOR_DECISION',
  'RESOLVED',
  'CLOSED',
];
const REGIONS: readonly ClaimRegion[] = ['NORTHEAST', 'SOUTHEAST', 'MIDWEST', 'SOUTHWEST', 'WEST'];
const FILTER_FIELDS = [
  'from',
  'to',
  'claimType',
  'priority',
  'status',
  'adjusterId',
  'team',
  'region',
] as const satisfies readonly (keyof OperationalFilters)[];

export function parseOperationalFilters(
  params: Readonly<Record<string, unknown>>,
): OperationalFilters {
  const value = (key: string): string => typeof params[key] === 'string' ? String(params[key]) : '';

  return {
    from: value('from'),
    to: value('to'),
    claimType: allowed(value('claimType'), CLAIM_TYPES),
    priority: allowed(value('priority'), PRIORITIES),
    status: allowed(value('status'), STATUSES),
    adjusterId: value('adjusterId'),
    team: value('team'),
    region: allowed(value('region'), REGIONS),
  };
}

export function serializeOperationalFilters(
  filters: OperationalFilters,
): Record<string, string> {
  const serialized: Record<string, string> = {};
  for (const field of FILTER_FIELDS) {
    const value = filters[field];
    if (value) serialized[field] = value;
  }
  return serialized;
}

export function operationalFilterKey(filters: OperationalFilters): string {
  const params = new URLSearchParams();
  for (const field of FILTER_FIELDS) params.set(field, filters[field]);
  return params.toString();
}

export function normalizeOperationalFilters(
  filters: Partial<OperationalFilters> | null | undefined,
): OperationalFilters {
  return {
    ...DEFAULT_OPERATIONAL_FILTERS,
    ...filters,
  };
}

function allowed<T extends string>(value: string, values: readonly T[]): T | '' {
  return values.includes(value as T) ? value as T : '';
}
