import { Params } from '@angular/router';
import {
  ClaimPriority,
  ClaimRegion,
  ClaimStatus,
  ClaimType,
} from '../../shared/models/claim.models';

export interface ClaimFilters {
  q: string;
  from: string;
  to: string;
  claimType: ClaimType | '';
  status: ClaimStatus | '';
  priority: ClaimPriority | '';
  assignment: string;
  adjusterId: string;
  team: string;
  region: ClaimRegion | '';
  page: number;
  size: number;
  sort: string;
}

export const DEFAULT_FILTERS: ClaimFilters = {
  q: '',
  from: '',
  to: '',
  claimType: '',
  status: '',
  priority: '',
  assignment: '',
  adjusterId: '',
  team: '',
  region: '',
  page: 0,
  size: 20,
  sort: 'createdAt,desc',
};

const CLAIM_TYPES: readonly ClaimType[] = ['AUTO', 'PROPERTY', 'PERSONAL_INJURY'];
const STATUSES: readonly ClaimStatus[] = ['NEW', 'UNDER_REVIEW', 'WAITING_FOR_INFORMATION', 'READY_FOR_DECISION', 'RESOLVED', 'CLOSED'];
const PRIORITIES: readonly ClaimPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const REGIONS: readonly ClaimRegion[] = ['NORTHEAST', 'SOUTHEAST', 'MIDWEST', 'SOUTHWEST', 'WEST'];
const FILTER_FIELDS = [
  'q',
  'from',
  'to',
  'claimType',
  'status',
  'priority',
  'assignment',
  'adjusterId',
  'team',
  'region',
  'page',
  'size',
  'sort',
] as const satisfies readonly (keyof ClaimFilters)[];

function enumValue<T extends string>(value: unknown, allowed: readonly T[]): T | '' {
  return typeof value === 'string' && allowed.includes(value as T) ? value as T : '';
}

export function parseClaimFilters(params: Params): ClaimFilters {
  const page = Math.max(0, Number(params['page'] ?? 0) || 0);
  const size = Math.min(100, Math.max(10, Number(params['size'] ?? 20) || 20));
  return {
    q: String(params['q'] ?? ''),
    from: String(params['from'] ?? ''),
    to: String(params['to'] ?? ''),
    claimType: enumValue(params['claimType'], CLAIM_TYPES),
    status: enumValue(params['status'], STATUSES),
    priority: enumValue(params['priority'], PRIORITIES),
    assignment: String(params['assignment'] ?? ''),
    adjusterId: String(params['adjusterId'] ?? ''),
    team: String(params['team'] ?? ''),
    region: enumValue(params['region'], REGIONS),
    page,
    size,
    sort: String(params['sort'] ?? 'createdAt,desc'),
  };
}

export function serializeClaimFilters(filters: ClaimFilters): Params {
  const params: Params = {};
  if (filters.q.trim()) params['q'] = filters.q.trim();
  if (filters.from) params['from'] = filters.from;
  if (filters.to) params['to'] = filters.to;
  if (filters.claimType) params['claimType'] = filters.claimType;
  if (filters.status) params['status'] = filters.status;
  if (filters.priority) params['priority'] = filters.priority;
  if (filters.assignment) params['assignment'] = filters.assignment;
  if (filters.adjusterId) params['adjusterId'] = filters.adjusterId;
  if (filters.team) params['team'] = filters.team;
  if (filters.region) params['region'] = filters.region;
  if (filters.page > 0) params['page'] = filters.page;
  if (filters.size !== 20) params['size'] = filters.size;
  if (filters.sort !== 'createdAt,desc') params['sort'] = filters.sort;
  return params;
}

export function claimFilterKey(filters: ClaimFilters): string {
  return FILTER_FIELDS
    .map(field => `${field}=${encodeURIComponent(String(filters[field]))}`)
    .join('&');
}
