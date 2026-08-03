import { Component } from '@angular/core';
import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClaimDetail, CreateClaimRequest } from '../../shared/models/claim.models';
import { ClaimsApiService } from '../data-access/claims-api.service';
import { NewClaimPageComponent } from './new-claim-page.component';

@Component({ standalone: true, template: '' })
class EmptyRouteComponent {}

const createdClaim = { id: 'claim-1' } as ClaimDetail;

describe('NewClaimPageComponent', () => {
  const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['create']);

  beforeEach(async () => {
    api.create.calls.reset();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [NewClaimPageComponent],
      providers: [
        provideRouter([
          { path: 'portal/claims/new', component: EmptyRouteComponent },
          { path: 'app/claims/new', component: EmptyRouteComponent },
          { path: '**', component: EmptyRouteComponent },
        ]),
        { provide: ClaimsApiService, useValue: api },
      ],
    }).compileComponents();
  });

  afterEach(() => sessionStorage.clear());

  it('rejects an incident date in the future', () => {
    const fixture = TestBed.createComponent(NewClaimPageComponent);
    const control = fixture.componentInstance.form.controls.incidentDate;
    control.setValue('2999-01-01');
    control.updateValueAndValidity();
    expect(control.hasError('futureDate')).toBeTrue();
  });

  it('accepts incomplete evidence so backend triage can report what is missing', () => {
    const fixture = TestBed.createComponent(NewClaimPageComponent);
    const component = fixture.componentInstance;
    component.form.patchValue({
      claimantName: 'Taylor Morgan',
      claimantEmail: 'taylor.morgan@example.test',
      claimType: 'AUTO',
      incidentDate: '2026-07-22',
      estimatedLoss: 12000,
      description: 'Vehicle sustained front-end damage in a low-speed collision.',
      incidentReportPresent: true,
      photosPresent: false,
    });
    expect(component.form.valid).toBeTrue();
  });

  it('updates reactive form controls through claim type and evidence cards', () => {
    const fixture = TestBed.createComponent(NewClaimPageComponent);
    fixture.detectChanges();

    const autoTypeCard = Array.from(
      fixture.nativeElement.querySelectorAll('label.claim-type-card') as NodeListOf<HTMLLabelElement>,
    ).find(card => card.textContent?.includes('Auto'));
    const autoType = autoTypeCard?.querySelector<HTMLInputElement>('input[type="radio"][formcontrolname="claimType"]');
    const photos = fixture.nativeElement.querySelector('input[formcontrolname="photosPresent"]') as HTMLInputElement;

    expect(autoType).withContext('AUTO claim type radio').not.toBeNull();
    expect(photos).withContext('Damage photos evidence checkbox').not.toBeNull();

    autoType!.click();
    photos.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.claimType.value).toBe('AUTO');
    expect(fixture.componentInstance.form.controls.photosPresent.value).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('1 evidence item selected');
  });

  it('submits the same typed request and enters the claimant portal when opened from the portal route', fakeAsync(() => {
    const router = TestBed.inject(Router);
    void router.navigateByUrl('/portal/claims/new');
    flushMicrotasks();
    api.create.and.returnValue(of(createdClaim));
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    const fixture = TestBed.createComponent(NewClaimPageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.form.setValue({
      claimantName: 'Taylor Reed',
      claimantEmail: 'taylor.reed@example.com',
      claimType: 'PROPERTY',
      incidentDate: '2026-07-30',
      estimatedLoss: 24500,
      description: 'A supply-line leak damaged the kitchen flooring and lower cabinets.',
      incidentReportPresent: true,
      photosPresent: false,
      proofOfOwnershipPresent: false,
      medicalDocumentationPresent: false,
    });
    component.submit();
    flushMicrotasks();

    const expected: CreateClaimRequest = {
      claimantName: 'Taylor Reed',
      claimantEmail: 'taylor.reed@example.com',
      claimType: 'PROPERTY',
      incidentDate: '2026-07-30',
      estimatedLoss: 24500,
      description: 'A supply-line leak damaged the kitchen flooring and lower cabinets.',
      incidentReportPresent: true,
      photosPresent: false,
      proofOfOwnershipPresent: false,
      medicalDocumentationPresent: false,
    };
    expect(component.portalMode).toBeTrue();
    expect(api.create).toHaveBeenCalledOnceWith(expected);
    expect(sessionStorage.getItem('claimsflow.demoClaimId')).toBe('claim-1');
    expect(navigate).toHaveBeenCalledOnceWith(['/portal/claims', 'claim-1']);
    expect(fixture.nativeElement.textContent).toContain('Start a claim');
  }));
});
