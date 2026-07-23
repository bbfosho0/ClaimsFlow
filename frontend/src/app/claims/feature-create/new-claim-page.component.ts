import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api/api-error';
import { ClaimType, CreateClaimRequest } from '../../shared/models/claim.models';
import { ClaimsApiService } from '../data-access/claims-api.service';

function localIsoDate(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function notFutureDate(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return String(control.value) > localIsoDate() ? { futureDate: true } : null;
}

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './new-claim-page.component.html',
  styleUrl: './new-claim-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewClaimPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(ClaimsApiService);
  private readonly router = inject(Router);

  @ViewChild('errorSummary') errorSummary?: ElementRef<HTMLElement>;

  readonly today = localIsoDate();
  readonly submitting = signal(false);
  readonly errors = signal<string[]>([]);
  readonly actionError = signal('');
  readonly claimTypes: ReadonlyArray<{ value: ClaimType; label: string; icon: string; description: string }> = [
    { value: 'AUTO', label: 'Auto', icon: '▣', description: 'Vehicle damage or collision' },
    { value: 'PROPERTY', label: 'Property', icon: '⌂', description: 'Home or business property' },
    { value: 'PERSONAL_INJURY', label: 'Personal injury', icon: '+', description: 'Medical or bodily injury' },
  ];

  readonly form = this.fb.group({
    claimantName: ['', [Validators.required, Validators.maxLength(160)]],
    claimantEmail: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    claimType: this.fb.control<ClaimType | ''>('', Validators.required),
    incidentDate: ['', [Validators.required, notFutureDate]],
    estimatedLoss: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    incidentReportPresent: [false],
    photosPresent: [false],
    proofOfOwnershipPresent: [false],
    medicalDocumentationPresent: [false],
  });

  selectClaimType(value: ClaimType): void {
    this.form.controls.claimType.setValue(value);
    this.form.controls.claimType.markAsTouched();
  }

  requiredCompleted(): number {
    const controls = [
      this.form.controls.claimantName,
      this.form.controls.claimantEmail,
      this.form.controls.claimType,
      this.form.controls.incidentDate,
      this.form.controls.estimatedLoss,
      this.form.controls.description,
    ];
    return controls.filter(control => control.valid && control.value !== '').length;
  }

  evidenceCount(): number {
    return [
      this.form.controls.incidentReportPresent.value,
      this.form.controls.photosPresent.value,
      this.form.controls.proofOfOwnershipPresent.value,
      this.form.controls.medicalDocumentationPresent.value,
    ].filter(Boolean).length;
  }

  selectedClaimTypeLabel(): string {
    return this.claimTypes.find(item => item.value === this.form.controls.claimType.value)?.label ?? 'Not selected';
  }

  submit(): void {
    this.errors.set([]);
    this.actionError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errors.set(this.collectErrors());
      setTimeout(() => this.errorSummary?.nativeElement.focus());
      return;
    }

    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const request: CreateClaimRequest = { ...raw, claimType: raw.claimType as ClaimType };
    this.api.create(request).subscribe({
      next: claim => void this.router.navigate(['/claims', claim.id]),
      error: (error: unknown) => {
        this.actionError.set(error instanceof ApiError ? error.message : 'The claim could not be created.');
        this.submitting.set(false);
      },
    });
  }

  private collectErrors(): string[] {
    const result: string[] = [];
    if (this.form.controls.claimantName.invalid) result.push('Claimant name is required.');
    if (this.form.controls.claimantEmail.invalid) result.push('Enter a valid claimant email.');
    if (this.form.controls.claimType.invalid) result.push('Select a claim type.');
    if (this.form.controls.incidentDate.invalid) result.push('Incident date must be today or earlier.');
    if (this.form.controls.estimatedLoss.invalid) result.push('Estimated loss cannot be negative.');
    if (this.form.controls.description.invalid) result.push('Description must contain 20 to 2000 characters.');
    return result;
  }
}
