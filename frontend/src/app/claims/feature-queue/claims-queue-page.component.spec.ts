import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ClaimsApiService } from '../data-access/claims-api.service';
import { ClaimsQueuePageComponent } from './claims-queue-page.component';

describe('ClaimsQueuePageComponent', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('renders applied filters and removes one while preserving the others', async () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['list']);
    api.list.and.returnValue(of({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }));

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'claims', component: ClaimsQueuePageComponent }]),
        { provide: ClaimsApiService, useValue: api },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/claims?status=NEW&priority=HIGH', ClaimsQueuePageComponent);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    harness.detectChanges();

    const root = harness.routeNativeElement!;
    const chips = Array.from(root.querySelectorAll('.filter-chip')) as HTMLButtonElement[];
    expect(chips.length).toBe(2);
    expect(root.textContent).toContain('New');
    expect(root.textContent).toContain('High priority');

    const statusChip = chips.find(button => button.textContent?.includes('New'));
    statusChip?.click();

    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { priority: 'HIGH', claimId: null } }));
  });

  it('selects and labels the reserved claim from a shareable claimId query parameter', async () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['list']);
    api.list.and.returnValue(of({
      content: [
        {
          id: 'claim-other', claimNumber: 'CLM-OTHER', claimantName: 'Other Claimant', claimType: 'AUTO', priority: 'LOW', status: 'NEW', slaDeadline: '2026-08-05T12:00:00Z', completenessPercentage: 100,
        },
        {
          id: 'claim-demo', claimNumber: 'CLM-2026-DEMO', claimantName: 'Taylor Reed', claimType: 'PROPERTY', priority: 'HIGH', status: 'UNDER_REVIEW', assignedAdjusterName: 'Jordan Lee', slaDeadline: '2026-08-03T18:00:00Z', completenessPercentage: 50,
        },
      ],
      page: 0,
      size: 20,
      totalElements: 2,
      totalPages: 1,
    }));

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'claims', component: ClaimsQueuePageComponent }]),
        { provide: ClaimsApiService, useValue: api },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/claims?claimId=claim-demo', ClaimsQueuePageComponent);
    harness.detectChanges();

    expect(component.selectedClaim()?.id).toBe('claim-demo');
    expect(harness.routeNativeElement?.textContent).toContain('Golden journey');
    expect(harness.routeNativeElement?.textContent).toContain('Taylor Reed');
  });
});
