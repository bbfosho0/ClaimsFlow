import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { ApiError } from '../core/api/api-error';
import { DemoRoleService } from '../core/demo-role/demo-role.service';
import { DemoJourneySnapshot } from './demo-journey.models';
import { DemoResetDialogComponent } from './demo-reset-dialog.component';
import { DemoJourneyService } from './demo-journey.service';

const snapshot: DemoJourneySnapshot = {
  claimId: 'claim-1',
  claimNumber: 'CLM-2026-DEMO01',
  adjusterId: 'adjuster-1',
  claimantRoute: '/portal/claims/claim-1',
  adjusterRoute: '/app/claims/claim-1?role=adjuster',
  managerRoute: '/app/dashboard?role=manager',
  administratorRoute: '/app/workflows?role=admin',
};

describe('DemoResetDialogComponent', () => {
  const journey = jasmine.createSpyObj<DemoJourneyService>('DemoJourneyService', ['reset']);
  const roles = jasmine.createSpyObj<DemoRoleService>('DemoRoleService', ['switchRole']);
  const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

  beforeEach(async () => {
    journey.reset.calls.reset();
    roles.switchRole.calls.reset();
    router.navigate.calls.reset();
    roles.switchRole.and.resolveTo(true);
    router.navigate.and.resolveTo(true);
    await TestBed.configureTestingModule({
      imports: [DemoResetDialogComponent],
      providers: [
        { provide: DemoJourneyService, useValue: journey },
        { provide: DemoRoleService, useValue: roles },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  it('shows the exact scoped confirmation and cancels without a request', () => {
    const fixture = TestBed.createComponent(DemoResetDialogComponent);
    const closed = jasmine.createSpy('closed');
    fixture.componentInstance.closed.subscribe(closed);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Reset only the reserved ClaimsFlow demo journey? Other claims will not be changed.');
    const cancel = fixture.nativeElement.querySelector('.dialog-button.secondary') as HTMLButtonElement;
    cancel.click();

    expect(closed).toHaveBeenCalledTimes(1);
    expect(journey.reset).not.toHaveBeenCalled();
  });

  it('calls reset once and disables both actions while pending', () => {
    const pending = new Subject<DemoJourneySnapshot>();
    journey.reset.and.returnValue(pending);
    const fixture = TestBed.createComponent(DemoResetDialogComponent);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.dialog-button.primary') as HTMLButtonElement).click();
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.dialog-button') as NodeListOf<HTMLButtonElement>;

    expect(journey.reset).toHaveBeenCalledTimes(1);
    expect(buttons[0].disabled).toBeTrue();
    expect(buttons[1].disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Resetting journey…');
  });

  it('keeps the dialog open and explains a disabled backend capability', () => {
    journey.reset.and.returnValue(throwError(() => new ApiError(404, 'ROUTE_NOT_FOUND', 'Not found.')));
    const fixture = TestBed.createComponent(DemoResetDialogComponent);
    fixture.detectChanges();

    fixture.componentInstance.confirm();
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('role')).not.toBe('presentation');
    expect(fixture.nativeElement.textContent).toContain('Demo reset is disabled. Start the backend with CLAIMSFLOW_DEMO_ENABLED=true.');
    expect(fixture.componentInstance.loading()).toBeFalse();
  });

  it('switches to Manager, emits completion, and opens the tour after success', fakeAsync(() => {
    const pending = new Subject<DemoJourneySnapshot>();
    journey.reset.and.returnValue(pending);
    const fixture = TestBed.createComponent(DemoResetDialogComponent);
    const completed = jasmine.createSpy('completed');
    fixture.componentInstance.completed.subscribe(completed);
    fixture.detectChanges();

    fixture.componentInstance.confirm();
    pending.next(snapshot);
    pending.complete();
    flushMicrotasks();

    expect(roles.switchRole).toHaveBeenCalledOnceWith('manager');
    expect(completed).toHaveBeenCalledOnceWith(snapshot);
    expect(router.navigate).toHaveBeenCalledWith(['/tour']);
  }));
});
