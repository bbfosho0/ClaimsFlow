import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  templateUrl: './progress-indicator.component.html',
  styleUrl: './progress-indicator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressIndicatorComponent {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly tone = input<'neutral' | 'success' | 'warning' | 'critical'>('neutral');
  readonly compact = input(false);
  readonly clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));
}
