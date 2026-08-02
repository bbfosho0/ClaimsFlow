export type SignalTone = 'healthy' | 'live' | 'advisory' | 'warning' | 'critical';

export interface OperationalSignal {
  id: string;
  x: number;
  y: number;
  radius: number;
  tone: SignalTone;
  label: string;
}

export const OPERATIONAL_SIGNALS: readonly OperationalSignal[] = [
  { id: 'sla-01', x: 132, y: 104, radius: 8, tone: 'critical', label: 'SLA breach risk' },
  { id: 'sla-02', x: 188, y: 150, radius: 6, tone: 'warning', label: 'SLA approaching' },
  { id: 'evidence-01', x: 246, y: 92, radius: 7, tone: 'warning', label: 'Repair estimate missing' },
  { id: 'evidence-02', x: 298, y: 142, radius: 6, tone: 'warning', label: 'Witness statement missing' },
  { id: 'ownership-01', x: 382, y: 108, radius: 6, tone: 'live', label: 'Assignment available' },
  { id: 'severity-01', x: 478, y: 88, radius: 8, tone: 'critical', label: 'Critical severity' },
  { id: 'healthy-01', x: 556, y: 134, radius: 6, tone: 'healthy', label: 'Evidence verified' },
  { id: 'advisory-01', x: 618, y: 198, radius: 7, tone: 'advisory', label: 'Recommendation ready' },
  { id: 'live-01', x: 524, y: 244, radius: 5, tone: 'live', label: 'Claim updated' },
  { id: 'healthy-02', x: 594, y: 308, radius: 6, tone: 'healthy', label: 'Audit complete' },
  { id: 'warning-03', x: 446, y: 326, radius: 7, tone: 'warning', label: 'Information requested' },
  { id: 'advisory-02', x: 348, y: 286, radius: 8, tone: 'advisory', label: 'Policy alignment' },
  { id: 'live-02', x: 272, y: 338, radius: 5, tone: 'live', label: 'Reviewer assigned' },
  { id: 'healthy-03', x: 186, y: 296, radius: 6, tone: 'healthy', label: 'Coverage verified' },
  { id: 'critical-02', x: 110, y: 258, radius: 7, tone: 'critical', label: 'High-value exposure' },
  { id: 'live-03', x: 92, y: 188, radius: 5, tone: 'live', label: 'New intake' },
  { id: 'advisory-03', x: 360, y: 194, radius: 9, tone: 'advisory', label: 'Decision support focus' },
];
