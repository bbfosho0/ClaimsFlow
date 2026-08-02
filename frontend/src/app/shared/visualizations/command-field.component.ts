import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OPERATIONAL_SIGNALS } from './signal-field';

export type CommandFieldVariant = 'showcase' | 'dashboard' | 'compact';

@Component({
  selector: 'app-command-field',
  standalone: true,
  templateUrl: './command-field.component.html',
  styleUrl: './command-field.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandFieldComponent {
  readonly activeCount = input(17);
  readonly variant = input<CommandFieldVariant>('dashboard');
  readonly reducedMotion = input(false);

  readonly signals = computed(() => OPERATIONAL_SIGNALS.slice(0, Math.max(0, Math.min(17, this.activeCount()))));
  readonly ariaLabel = computed(() => `${this.signals().length} operational signals grouped by SLA pressure, missing evidence, ownership, severity, and decision support.`);

  toneClass(tone: string): string {
    return `signal-${tone}`;
  }
}
