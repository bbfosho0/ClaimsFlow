import { ValidatorFn, Validators } from '@angular/forms';

export const REVIEW_REASON_MIN_LENGTH = 8;
export const REVIEW_REASON_MAX_LENGTH = 500;

export function reviewReasonValidators(): ValidatorFn[] {
  return [
    Validators.required,
    Validators.minLength(REVIEW_REASON_MIN_LENGTH),
    Validators.maxLength(REVIEW_REASON_MAX_LENGTH),
  ];
}

export function normalizeReviewReason(value: string): string {
  return value.trim();
}
