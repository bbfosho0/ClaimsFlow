import { completenessTone, formatSla, humanizeEnum, priorityTone, statusTone } from './claim-presentation';

describe('claim presentation', () => {
  it('humanizes enum values', () => {
    expect(humanizeEnum('WAITING_FOR_INFORMATION')).toBe('Waiting For Information');
  });

  it('formats urgent and expired SLA values', () => {
    const now = new Date('2026-07-23T12:00:00Z');
    expect(formatSla('2026-07-23T17:00:00Z', now)).toEqual({
      label: 'Due in 5h',
      detail: 'Jul 23, 2026, 5:00 PM',
      tone: 'warning',
    });
    expect(formatSla('2026-07-23T10:00:00Z', now).label).toBe('Overdue by 2h');
    expect(formatSla('2026-07-23T10:00:00Z', now).tone).toBe('critical');
  });

  it('maps completeness and workflow states to semantic tones', () => {
    expect(completenessTone(100)).toBe('success');
    expect(completenessTone(50)).toBe('warning');
    expect(completenessTone(80)).toBe('neutral');
    expect(priorityTone('CRITICAL')).toBe('critical');
    expect(statusTone('READY_FOR_DECISION')).toBe('success');
  });
});
