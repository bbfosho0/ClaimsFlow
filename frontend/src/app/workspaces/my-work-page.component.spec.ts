import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClaimsApiService } from '../claims/data-access/claims-api.service';
import { ClaimPage } from '../shared/models/claim.models';
import { MyWorkPageComponent } from './my-work-page.component';

const page: ClaimPage = {
  content: [
    {
      id: 'claim-demo',
      claimNumber: 'CLM-2026-DEMO',
      claimantName: 'Taylor Reed',
      claimType: 'PROPERTY',
      priority: 'HIGH',
      status: 'UNDER_REVIEW',
      assignedAdjusterName: 'Jordan Lee',
      slaDeadline: '2026-08-03T18:00:00Z',
      completenessPercentage: 50,
    },
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
};

describe('MyWorkPageComponent', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => sessionStorage.clear());

  it('queries the real adjuster UUID from session storage and marks the golden journey claim', async () => {
    sessionStorage.setItem('claimsflow.demoAdjusterId', 'adjuster-jordan');
    sessionStorage.setItem('claimsflow.demoClaimId', 'claim-demo');
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['list']);
    api.list.and.returnValue(of(page));

    await TestBed.configureTestingModule({
      imports: [MyWorkPageComponent],
      providers: [provideRouter([]), { provide: ClaimsApiService, useValue: api }],
    }).compileComponents();

    const fixture = TestBed.createComponent(MyWorkPageComponent);
    fixture.detectChanges();

    expect(api.list).toHaveBeenCalledWith(jasmine.objectContaining({
      assignment: 'adjuster-jordan',
      sort: 'slaDeadline,asc',
    }));
    expect(fixture.nativeElement.textContent).toContain('Taylor Reed');
    expect(fixture.nativeElement.textContent).toContain('Golden journey');
    expect(fixture.nativeElement.textContent).toContain('API-backed');
  });

  it('explains how to resolve the adjuster when the demo has not been reset', async () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['list']);
    await TestBed.configureTestingModule({
      imports: [MyWorkPageComponent],
      providers: [provideRouter([]), { provide: ClaimsApiService, useValue: api }],
    }).compileComponents();

    const fixture = TestBed.createComponent(MyWorkPageComponent);
    fixture.detectChanges();

    expect(api.list).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Reset the golden journey');
  });
});
