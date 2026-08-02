import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnChanges, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { normalizeReviewReason, reviewReasonValidators } from '../../shared/recommendation-review/recommendation-review.validators';
import { PreparedAction } from '../intelligence.models';

export interface ConfirmedIntelligenceAction {
  action: PreparedAction;
  reason: string;
}

@Component({
  selector: 'app-intelligence-action-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './intelligence-action-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntelligenceActionDialogComponent implements OnChanges {
  readonly action = input<PreparedAction | null>(null);
  readonly acting = input(false);
  readonly cancelled = output<void>();
  readonly confirmed = output<ConfirmedIntelligenceAction>();
  readonly reason = new FormControl('', { nonNullable: true, validators: reviewReasonValidators() });

  ngOnChanges(): void {
    this.reason.reset('');
    this.reason.markAsUntouched();
  }

  confirm(): void {
    const action = this.action();
    if (!action) return;
    if (action.requiresReason && this.reason.invalid) {
      this.reason.markAsTouched();
      return;
    }
    this.confirmed.emit({ action, reason: normalizeReviewReason(this.reason.value) });
  }
}
