import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NewClaimPageComponent } from './new-claim-page.component';

describe('NewClaimPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewClaimPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

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

    const autoType = fixture.nativeElement.querySelector('input[type="radio"][value="AUTO"]') as HTMLInputElement;
    const photos = fixture.nativeElement.querySelector('input[formcontrolname="photosPresent"]') as HTMLInputElement;
    autoType.click();
    photos.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.claimType.value).toBe('AUTO');
    expect(fixture.componentInstance.form.controls.photosPresent.value).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('1 evidence item selected');
  });
});
