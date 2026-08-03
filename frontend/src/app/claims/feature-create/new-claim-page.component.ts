import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api/api-error';
import { ClaimDetail, ClaimType, CreateClaimRequest } from '../../shared/models/claim.models';
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
  styleUrls: ['./new-claim-page.component.css', './new-claim-portal.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewClaimPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(ClaimsApiService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  @ViewChild('errorSummary') errorSummary?: ElementRef<HTMLElement>;

  readonly portalMode = this.router.url.startsWith('/portal/');
  readonly backRoute = this.portalMode ? '/portal' : '/app/claims';
  readonly today = localIsoDate();
  readonly submitting = signal(false);
  readonly errors = signal<string[]>([]);
  readonly actionError = signal('');
  readonly currentGate = signal(1);
  readonly uploadedFiles = signal<string[]>([]);
  readonly uploadError = signal('');
  readonly claimTypes: ReadonlyArray<{ value: ClaimType; label: string; icon: string; description: string }> = [
    { value: 'AUTO' as ClaimType, label: 'Auto', icon: '▣', description: 'Vehicle damage or collision' },
    { value: 'PROPERTY' as ClaimType, label: 'Property', icon: '⌂', description: 'Home or business property' },
    { value: 'PERSONAL_INJURY' as ClaimType, label: 'Personal injury', icon: '+', description: 'Medical or bodily injury' },
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

  setGate(gate: number): void {
    this.currentGate.set(Math.max(1, Math.min(4, gate)));
    queueMicrotask(() => this.document.getElementById(`intake-gate-${gate}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  gateComplete(gate: number): boolean {
    if (gate === 1) return this.form.controls.claimantName.valid && this.form.controls.claimantEmail.valid;
    if (gate === 2) return this.form.controls.claimType.valid && this.form.controls.incidentDate.valid && this.form.controls.estimatedLoss.valid && this.form.controls.description.valid;
    if (gate === 3) return this.evidenceCount() > 0 || this.uploadedFiles().length > 0;
    return this.form.valid;
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

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.uploadError.set('');
    const oversized = files.find(file => file.size > 10 * 1024 * 1024);
    if (oversized) {
      this.uploadError.set(`${oversized.name} exceeds the 10 MB evidence limit. Your form draft remains safe.`);
      input.value = '';
      return;
    }
    this.uploadedFiles.set(files.map(file => file.name));
  }

  clearUploadedFiles(input: HTMLInputElement): void {
    this.uploadedFiles.set([]);
    this.uploadError.set('');
    input.value = '';
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
      next: claim => this.completeCreation(claim),
      error: (error: unknown) => {
        this.actionError.set(error instanceof ApiError ? error.message : 'The claim could not be created. Your draft remains in this form.');
        this.submitting.set(false);
      },
    });
  }

  private completeCreation(claim: ClaimDetail): void {
    if (this.portalMode) {
      try {
        this.document.defaultView?.sessionStorage.setItem('claimsflow.demoClaimId', claim.id);
      } catch {
        // The route still works even when session persistence is unavailable.
      }
      void this.router.navigate(['/portal/claims', claim.id]);
      return;
    }
    void this.router.navigate(['/app/claims', claim.id]);
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
