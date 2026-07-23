export type SemanticTone = 'neutral' | 'info' | 'success' | 'warning' | 'critical';

export interface SlaPresentation {
  label: string;
  detail: string;
  tone: 'neutral' | 'warning' | 'critical';
}

export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

export function formatSla(deadline: string, now: Date = new Date()): SlaPresentation {
  const target = new Date(deadline);
  const difference = target.getTime() - now.getTime();
  const absoluteHours = Math.max(1, Math.ceil(Math.abs(difference) / 3_600_000));
  const detail = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(target);

  if (difference < 0) {
    return { label: `Overdue by ${absoluteHours}h`, detail, tone: 'critical' };
  }
  if (difference <= 24 * 3_600_000) {
    return { label: `Due in ${absoluteHours}h`, detail, tone: 'warning' };
  }
  if (difference <= 48 * 3_600_000) {
    return { label: 'Due tomorrow', detail, tone: 'neutral' };
  }

  return {
    label: `${Math.ceil(difference / 86_400_000)}d remaining`,
    detail,
    tone: 'neutral',
  };
}

export function completenessTone(value: number): 'neutral' | 'warning' | 'success' {
  if (value >= 100) return 'success';
  if (value < 60) return 'warning';
  return 'neutral';
}

export function priorityTone(priority: string): SemanticTone {
  if (priority === 'CRITICAL') return 'critical';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'LOW') return 'neutral';
  return 'info';
}

export function statusTone(status: string): SemanticTone {
  if (status === 'RESOLVED' || status === 'CLOSED' || status === 'READY_FOR_DECISION') return 'success';
  if (status === 'WAITING_FOR_INFORMATION') return 'warning';
  if (status === 'UNDER_REVIEW' || status === 'NEW') return 'info';
  return 'neutral';
}
