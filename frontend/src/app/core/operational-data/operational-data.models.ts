import {
  ClaimPage,
  ClaimPriority,
  ClaimRegion,
  ClaimStatus,
  ClaimType,
} from '../../shared/models/claim.models';
import { DashboardSnapshot } from '../../shared/models/dashboard.models';

export type OperationalFamily = 'dashboard' | 'queue' | 'myWork' | 'analytics' | 'team' | 'evidence';

export interface OperationalResource<T> {
  readonly value: T | null;
  readonly loading: boolean;
  readonly refreshing: boolean;
  readonly stale: boolean;
  readonly error: string;
  readonly updatedAt: Date | null;
  readonly changedClaimIds: readonly string[];
}

export interface OperationalFilters {
  readonly from: string;
  readonly to: string;
  readonly claimType: ClaimType | '';
  readonly priority: ClaimPriority | '';
  readonly status: ClaimStatus | '';
  readonly adjusterId: string;
  readonly team: string;
  readonly region: ClaimRegion | '';
}

export const DEFAULT_OPERATIONAL_FILTERS: OperationalFilters = {
  from: '',
  to: '',
  claimType: '',
  priority: '',
  status: '',
  adjusterId: '',
  team: '',
  region: '',
};

export interface OperationalAdjusterOption {
  readonly id: string;
  readonly displayName: string;
  readonly team: string;
}

export interface OperationalFilterOptions {
  readonly claimTypes: readonly ClaimType[];
  readonly priorities: readonly ClaimPriority[];
  readonly statuses: readonly ClaimStatus[];
  readonly regions: readonly ClaimRegion[];
  readonly teams: readonly string[];
  readonly adjusters: readonly OperationalAdjusterOption[];
}

export const EMPTY_OPERATIONAL_FILTER_OPTIONS: OperationalFilterOptions = {
  claimTypes: [],
  priorities: [],
  statuses: [],
  regions: [],
  teams: [],
  adjusters: [],
};

export interface MyWorkClaim {
  readonly id: string;
  readonly claimNumber: string;
  readonly claimantName: string;
  readonly claimType: ClaimType;
  readonly region: ClaimRegion;
  readonly priority: ClaimPriority;
  readonly status: ClaimStatus;
  readonly slaDeadline: string;
  readonly completenessPercentage: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MyWorkTimelineItem {
  readonly claimId: string;
  readonly claimNumber: string;
  readonly claimantName: string;
  readonly priority: ClaimPriority;
  readonly status: ClaimStatus;
  readonly slaDeadline: string;
  readonly completenessPercentage: number;
  readonly group: 'NOW' | 'TODAY' | 'LATER';
  readonly reason: string;
  readonly tone: string;
}

export interface WorkloadPoint {
  readonly date: string;
  readonly activeClaims: number;
}

export interface MyWorkSnapshot {
  readonly generatedAt: string;
  readonly adjusterId: string;
  readonly displayName: string;
  readonly team: string;
  readonly capacity: number;
  readonly activeClaims: number;
  readonly dueWithin24Hours: number;
  readonly overdueClaims: number;
  readonly evidenceBlockedClaims: number;
  readonly utilizationPercentage: number;
  readonly workloadTrend: readonly WorkloadPoint[];
  readonly timeline: readonly MyWorkTimelineItem[];
  readonly claims: readonly MyWorkClaim[];
}

export interface AnalyticsKpis {
  readonly estimatedExposure: number;
  readonly totalClaims: number;
  readonly openClaims: number;
  readonly resolvedClaims: number;
  readonly averageResolutionHours: number;
  readonly evidenceReadinessPercentage: number;
  readonly slaCompliancePercentage: number;
}

export interface MetricChange {
  readonly kind: 'PERCENTAGE' | 'NEW' | 'CLEARED' | 'UNCHANGED';
  readonly percentage: number | null;
}

export interface AnalyticsComparison {
  readonly previousFrom: string;
  readonly previousTo: string;
  readonly previousTotalClaims: number;
  readonly previousEstimatedExposure: number;
  readonly previousAverageResolutionHours: number;
  readonly claimVolumeChange: MetricChange;
  readonly exposureChange: MetricChange;
  readonly resolutionTimeChange: MetricChange;
}

export interface TimePoint {
  readonly date: string;
  readonly count: number;
}

export interface DistributionPoint {
  readonly key: string;
  readonly label: string;
  readonly count: number;
  readonly percentage: number;
}

export interface ResolutionByType {
  readonly key: string;
  readonly label: string;
  readonly averageHours: number | null;
  readonly resolvedClaims: number;
}

export interface MonetaryDistributionPoint {
  readonly key: string;
  readonly label: string;
  readonly amount: number;
  readonly count: number;
  readonly percentage: number;
}

export interface CohortRow {
  readonly weekStart: string;
  readonly totalClaims: number;
  readonly resolvedWithin7DaysPercentage: number;
  readonly resolvedWithin14DaysPercentage: number;
  readonly resolvedWithin30DaysPercentage: number;
}

export interface AnalyticsSnapshot {
  readonly generatedAt: string;
  readonly options: OperationalFilterOptions;
  readonly kpis: AnalyticsKpis;
  readonly comparison: AnalyticsComparison;
  readonly claimVolume: readonly TimePoint[];
  readonly resolvedVolume: readonly TimePoint[];
  readonly openPortfolioTrend?: readonly TimePoint[];
  readonly statusDistribution: readonly DistributionPoint[];
  readonly priorityDistribution: readonly DistributionPoint[];
  readonly regionDistribution: readonly DistributionPoint[];
  readonly agingBands: readonly DistributionPoint[];
  readonly evidenceReadinessBands?: readonly DistributionPoint[];
  readonly resolutionByClaimType?: readonly ResolutionByType[];
  readonly exposureByClaimType?: readonly MonetaryDistributionPoint[];
  readonly cohorts: readonly CohortRow[];
}

export interface TeamKpis {
  readonly activeClaims: number;
  readonly atRiskClaims: number;
  readonly overdueClaims: number;
  readonly slaCompliancePercentage: number;
  readonly evidenceReadinessPercentage: number;
  readonly assignmentCoveragePercentage: number;
  readonly overallUtilizationPercentage: number;
}

export interface TeamWorkload {
  readonly name: string;
  readonly activeClaims: number;
  readonly capacity: number;
  readonly utilizationPercentage: number;
  readonly evidenceReadinessPercentage: number;
  readonly slaCompliancePercentage: number;
  readonly atRiskClaims?: number;
  readonly overdueClaims?: number;
  readonly highPriorityClaims?: number;
  readonly nextSlaDeadline?: string | null;
}

export interface AdjusterWorkload {
  readonly adjusterId: string;
  readonly displayName: string;
  readonly team: string;
  readonly activeClaims: number;
  readonly capacity: number;
  readonly utilizationPercentage: number;
  readonly atRiskClaims?: number;
  readonly overdueClaims?: number;
  readonly highPriorityClaims?: number;
  readonly evidenceReadinessPercentage?: number;
  readonly nextSlaDeadline?: string | null;
}

export interface TeamEscalation {
  readonly claimId: string;
  readonly claimNumber: string;
  readonly claimantName: string;
  readonly priority: ClaimPriority;
  readonly status: ClaimStatus;
  readonly slaDeadline: string;
  readonly reason: string;
  readonly tone: string;
}

export interface TeamAdvisory {
  readonly title: string;
  readonly detail: string;
  readonly route: string;
  readonly queryParams: Readonly<Record<string, string>>;
  readonly tone: string;
}

export interface IntegrityScore {
  readonly overall: number;
  readonly slaCompliance: number;
  readonly evidenceReadiness: number;
  readonly assignmentCoverage: number;
  readonly label: string;
}

export interface TeamPriorityMix {
  readonly team: string;
  readonly segments: readonly DistributionPoint[];
}

export interface TeamSlaPerformance {
  readonly team: string;
  readonly compliancePercentage: number | null;
  readonly resolvedClaims: number;
}

export interface CapacityTrendPoint {
  readonly date: string;
  readonly utilizationPercentage: number;
}

export interface TeamOperationsSnapshot {
  readonly generatedAt: string;
  readonly options: OperationalFilterOptions;
  readonly kpis: TeamKpis;
  readonly teams: readonly TeamWorkload[];
  readonly adjusters: readonly AdjusterWorkload[];
  readonly escalations: readonly TeamEscalation[];
  readonly advisories: readonly TeamAdvisory[];
  readonly integrity: IntegrityScore;
  readonly teamPriorityMix?: readonly TeamPriorityMix[];
  readonly teamSlaPerformance?: readonly TeamSlaPerformance[];
  readonly capacityTrend?: readonly CapacityTrendPoint[];
}

export interface EvidenceClaimSummary {
  readonly id: string;
  readonly claimNumber: string;
  readonly claimantName: string;
  readonly claimType: ClaimType;
  readonly status: ClaimStatus;
  readonly priority: ClaimPriority;
  readonly region: ClaimRegion;
  readonly completenessPercentage: number;
  readonly slaDeadline: string;
  readonly adjusterName?: string;
  readonly team?: string;
  readonly evidence?: readonly EvidenceCategory[];
}

export interface EvidenceCategory {
  readonly kind: string;
  readonly label: string;
  readonly present: boolean;
  readonly state: string;
}

export interface EvidenceClaimantMessage {
  readonly id: string;
  readonly author: string;
  readonly audience: 'CLAIMANT';
  readonly body: string;
  readonly createdAt: string;
}

export interface EvidenceClaimDetail extends EvidenceClaimSummary {
  readonly claimantEmail: string;
  readonly estimatedLoss: number;
  readonly createdAt: string;
  readonly evidence: readonly EvidenceCategory[];
  readonly claimantMessages: readonly EvidenceClaimantMessage[];
}

export interface EvidenceOperationsKpis {
  readonly claimsMissingEvidence: number;
  readonly averageReadinessPercentage: number;
  readonly atRiskWithEvidenceGap: number;
  readonly fullyCompleteClaims: number;
}

export interface EvidenceOperationsSnapshot {
  readonly generatedAt: string;
  readonly options: OperationalFilterOptions;
  readonly claims: readonly EvidenceClaimSummary[];
  readonly selected: EvidenceClaimDetail | null;
  readonly kpis?: EvidenceOperationsKpis;
}

export type OperationalSnapshot =
  | DashboardSnapshot
  | ClaimPage
  | MyWorkSnapshot
  | AnalyticsSnapshot
  | TeamOperationsSnapshot
  | EvidenceOperationsSnapshot;
