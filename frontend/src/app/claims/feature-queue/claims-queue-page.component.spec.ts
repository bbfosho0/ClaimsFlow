import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ClaimsApiService } from '../data-access/claims-api.service';
import { ClaimsQueuePageComponent } from './claims-queue-page.component';

describe('ClaimsQueuePageComponent', () => {
  it('renders applied filters and removes one while preserving the others', async () => {
    const api = jasmine.createSpyObj<ClaimsApiService>('ClaimsApiService', ['list']);
    api.list.and.returnValue(of({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    }));

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

    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { priority: 'HIGH' },
    }));
  });
});
