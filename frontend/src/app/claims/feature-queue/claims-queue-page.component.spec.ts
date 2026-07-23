import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
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
      imports: [ClaimsQueuePageComponent],
      providers: [
        provideRouter([]),
        { provide: ClaimsApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { queryParams: of({ status: 'NEW', priority: 'HIGH' }) } },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const fixture = TestBed.createComponent(ClaimsQueuePageComponent);
    fixture.detectChanges();

    const chips = Array.from(fixture.nativeElement.querySelectorAll<HTMLButtonElement>('.filter-chip'));
    expect(chips.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('New');
    expect(fixture.nativeElement.textContent).toContain('High priority');

    const statusChip = chips.find(button => button.textContent?.includes('New'));
    statusChip?.click();

    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { priority: 'HIGH' },
    }));
  });
});
