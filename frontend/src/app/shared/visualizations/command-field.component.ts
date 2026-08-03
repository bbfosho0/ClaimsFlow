import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DashboardSignalCount } from '../models/dashboard.models';
import { OPERATIONAL_SIGNALS, OperationalSignal, SignalTone } from './signal-field';

export type CommandFieldVariant = 'showcase' | 'dashboard' | 'compact';

const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  SLA: 'SLA pressure',
  EVIDENCE: 'Evidence incomplete',
  OWNERSHIP: 'Ownership unresolved',
  PRIORITY: 'High-priority review',
  ADVISORY: 'Portfolio advisory',
};

@Component({
  selector: 'app-command-field',
  standalone: true,
  templateUrl: './command-field.component.html',
  styleUrl: './command-field.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandFieldComponent {
  readonly activeCount = input(17);
  readonly signalCounts = input<readonly DashboardSignalCount[]>([]);
  readonly variant = input<CommandFieldVariant>('dashboard');
  readonly reducedMotion = input(false);

  readonly signals = computed(() => {
    const counts = this.signalCounts();
    if (!counts.length) {
      return OPERATIONAL_SIGNALS.slice(0, Math.max(0, Math.min(17, this.activeCount())));
    }
    return allocateSignals(counts, 17);
  });

  readonly ariaLabel = computed(() => {
    const counts = this.signalCounts().filter(item => item.count > 0);
    if (!counts.length) {
      return `${this.signals().length} operational signals grouped by SLA pressure, missing evidence, ownership, severity, and decision support.`;
    }
    const detail = counts
      .map(item => `${item.count} ${CATEGORY_LABELS[item.category] ?? item.category.toLowerCase()}`)
      .join(', ');
    return `${this.signals().length} displayed operational signals. Current portfolio counts: ${detail}.`;
  });

  toneClass(tone: string): string {
    return `signal-${tone}`;
  }
}

export function allocateSignals(
  counts: readonly DashboardSignalCount[],
  maximum: number,
): readonly OperationalSignal[] {
  const active = counts.filter(item => item.count > 0);
  if (!active.length || maximum <= 0) return [];

  const totalCount = active.reduce((sum, item) => sum + item.count, 0);
  const slots = Math.min(maximum, Math.max(active.length, totalCount));
  const allocation = new Map<DashboardSignalCount, number>(active.map(item => [item, 1]));
  let remaining = slots - active.length;

  if (remaining > 0) {
    const weighted = active.map(item => {
      const exact = remaining * (item.count / totalCount);
      const whole = Math.floor(exact);
      allocation.set(item, (allocation.get(item) ?? 0) + whole);
      return { item, remainder: exact - whole };
    });
    remaining -= weighted.reduce((sum, value) => sum + Math.floor((slots - active.length) * (value.item.count / totalCount)), 0);
    weighted.sort((a, b) => b.remainder - a.remainder || b.item.count - a.item.count);
    for (let index = 0; index < remaining; index++) {
      const target = weighted[index % weighted.length]!.item;
      allocation.set(target, (allocation.get(target) ?? 0) + 1);
    }
  }

  const categories = active.flatMap(item =>
    Array.from({ length: allocation.get(item) ?? 0 }, (_, index) => ({ item, index })),
  );

  return categories.slice(0, maximum).map(({ item, index }, positionIndex) => {
    const position = OPERATIONAL_SIGNALS[positionIndex % OPERATIONAL_SIGNALS.length]!;
    return {
      ...position,
      id: `${item.category.toLowerCase()}-${index + 1}`,
      tone: item.tone as SignalTone,
      label: CATEGORY_LABELS[item.category] ?? item.category,
    };
  });
}
