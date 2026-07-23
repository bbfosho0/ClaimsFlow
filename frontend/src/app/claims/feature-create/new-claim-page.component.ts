import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api/api-error';
import { ClaimType, CreateClaimRequest } from '../../shared/models/claim.models';
import { ClaimsApiService } from '../data-access/claims-api.service';

function evidenceValidator(control: AbstractControl): ValidationErrors | null {
  const type = control.get('claimType')?.value as ClaimType | '';
  const missing: string[] = [];
  if (type === 'AUTO') { if (!control.get('incidentReportPresent')?.value) missing.push('Incident report'); if (!control.get('photosPresent')?.value) missing.push('Damage photos'); }
  if (type === 'PROPERTY') { if (!control.get('photosPresent')?.value) missing.push('Property photos'); if (!control.get('proofOfOwnershipPresent')?.value) missing.push('Proof of ownership'); }
  if (type === 'PERSONAL_INJURY') { if (!control.get('incidentReportPresent')?.value) missing.push('Incident report'); if (!control.get('medicalDocumentationPresent')?.value) missing.push('Medical documentation'); }
  return missing.length ? { missingEvidence: missing } : null;
}

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <header class="page-header"><div><p class="eyebrow">Claim intake</p><h1>Create a claim</h1><p>Capture the initial facts and evidence indicators. Backend rules perform authoritative triage.</p></div><a routerLink="/claims">Back to queue</a></header>
    <div #errorSummary *ngIf="errors().length" class="alert" tabindex="-1" role="alert"><strong>Review the following:</strong><ul><li *ngFor="let error of errors()">{{error}}</li></ul></div>
    <form class="form-card" [formGroup]="form" (ngSubmit)="submit()">
      <section><h2>Claimant</h2><div class="grid"><label>Full name<input formControlName="claimantName"></label><label>Email<input type="email" formControlName="claimantEmail"></label></div></section>
      <section><h2>Incident</h2><div class="grid"><label>Claim type<select formControlName="claimType"><option value="">Select type</option><option value="AUTO">Auto</option><option value="PROPERTY">Property</option><option value="PERSONAL_INJURY">Personal injury</option></select></label><label>Incident date<input type="date" [max]="today" formControlName="incidentDate"></label><label>Estimated loss<input type="number" min="0" step="0.01" formControlName="estimatedLoss"></label></div><label>Description<textarea rows="5" formControlName="description" placeholder="Describe what happened and the known impact."></textarea><small>{{form.controls.description.value.length}} / 2000</small></label></section>
      <section><h2>Evidence available</h2><p class="hint">Claims may be submitted incomplete. Missing evidence will be surfaced in triage.</p><div class="checks"><label><input type="checkbox" formControlName="incidentReportPresent"> Incident report</label><label><input type="checkbox" formControlName="photosPresent"> Photos</label><label><input type="checkbox" formControlName="proofOfOwnershipPresent"> Proof of ownership</label><label><input type="checkbox" formControlName="medicalDocumentationPresent"> Medical documentation</label></div></section>
      <div *ngIf="actionError()" class="alert" role="alert">{{actionError()}}</div><div class="actions"><button class="button primary" type="submit" [disabled]="submitting()">{{submitting()?'Creating…':'Create claim'}}</button><a class="button secondary" routerLink="/claims">Cancel</a></div>
    </form>
  `,
  styles: [`.page-header{display:flex;justify-content:space-between;gap:1rem;margin-bottom:1.5rem}.page-header h1{margin:.15rem 0}.page-header p{margin:.25rem 0;color:#5d6b80}.eyebrow{text-transform:uppercase;font-weight:700;font-size:.75rem;letter-spacing:.12em;color:#287b70!important}.form-card{background:#fff;border:1px solid #dbe4ef;border-radius:14px;padding:1.5rem;max-width:900px}.form-card section+section{border-top:1px solid #e6edf5;margin-top:1.5rem;padding-top:1.5rem}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}.form-card label{display:grid;gap:.4rem;font-weight:700;margin-bottom:1rem}.form-card input,.form-card select,.form-card textarea{border:1px solid #c9d5e4;border-radius:8px;padding:.75rem;background:#fff}.form-card small,.hint{color:#68768a;font-weight:400}.checks{display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem}.checks label{display:flex;align-items:center;gap:.5rem;font-weight:500}.actions{display:flex;gap:.75rem;margin-top:1.5rem}.button{border:0;text-decoration:none;padding:.75rem 1rem;border-radius:8px;font-weight:700}.primary{background:#16796d;color:#fff}.secondary{background:#e8eef6;color:#26364e}.alert{background:#fff1f0;border:1px solid #ffb8b2;padding:1rem;border-radius:10px;color:#8c231a;margin-bottom:1rem}@media(max-width:650px){.grid,.checks{grid-template-columns:1fr}.page-header{display:block}}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewClaimPageComponent implements AfterViewInit {
  private readonly fb=inject(NonNullableFormBuilder); private readonly api=inject(ClaimsApiService); private readonly router=inject(Router);
  @ViewChild('errorSummary') errorSummary?:ElementRef<HTMLElement>;
  readonly today=new Date().toISOString().slice(0,10); readonly submitting=signal(false); readonly errors=signal<string[]>([]); readonly actionError=signal('');
  readonly form=this.fb.group({claimantName:['',[Validators.required,Validators.maxLength(160)]],claimantEmail:['',[Validators.required,Validators.email,Validators.maxLength(200)]],claimType:this.fb.control<ClaimType|''>('',Validators.required),incidentDate:['',Validators.required],estimatedLoss:[0,[Validators.required,Validators.min(0)]],description:['',[Validators.required,Validators.minLength(20),Validators.maxLength(2000)]],incidentReportPresent:[false],photosPresent:[false],proofOfOwnershipPresent:[false],medicalDocumentationPresent:[false]});
  ngAfterViewInit():void{}
  submit():void{this.errors.set([]);this.actionError.set('');if(this.form.invalid){this.form.markAllAsTouched();this.errors.set(this.collectErrors());setTimeout(()=>this.errorSummary?.nativeElement.focus());return;}this.submitting.set(true);const raw=this.form.getRawValue();const request:CreateClaimRequest={...raw,claimType:raw.claimType as ClaimType};this.api.create(request).subscribe({next:claim=>void this.router.navigate(['/claims',claim.id]),error:(error:unknown)=>{this.actionError.set(error instanceof ApiError?error.message:'The claim could not be created.');this.submitting.set(false);}});}
  private collectErrors():string[]{const result:string[]=[];if(this.form.controls.claimantName.invalid)result.push('Claimant name is required.');if(this.form.controls.claimantEmail.invalid)result.push('Enter a valid claimant email.');if(this.form.controls.claimType.invalid)result.push('Select a claim type.');if(this.form.controls.incidentDate.invalid||this.form.controls.incidentDate.value>this.today)result.push('Incident date must be today or earlier.');if(this.form.controls.estimatedLoss.invalid)result.push('Estimated loss cannot be negative.');if(this.form.controls.description.invalid)result.push('Description must contain 20 to 2000 characters.');return result;}
}
