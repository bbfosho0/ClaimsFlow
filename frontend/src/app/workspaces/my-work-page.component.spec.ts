import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { ClaimPage } from '../shared/models/claim.models';
import { MyWorkPageComponent } from './my-work-page.component';

const page: ClaimPage = {
  content: [
    {
      id: 'claim-demo',
      claimNumber: 'CLM-2026-DEMO',
      claimantName: 'Taylor Reed',
      claimType: 'PROPERTY',
      region: 'SOUTHEAST',
      priority: 'HIGH',
      status: 'UNDER_REVIEW',
      assignedAdjusterName: 'Jordan Lee',
      assignedTeam: 'SIU Investigations',
      slaDeadline: '2026-08-03T18:00:00Z',
      completenessPercentage: 50,
      createdAt: '2026-08-03T05:00:00Z',
      updatedAt: '2026-08-03T06:00:00Z',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
};

function createStore(value: ClaimPage | null = page): any {
  const queue = signal({
    value,
    loading: false,
    refreshing: false,
    stale: false,
    error: '',
    updatedAt: value ? new Date('2026-08-03T12:00:00Z') : null,
    changedClaimIds: ['claim-demo'],
  });
  const store = jasmine.createSpyObj<OperationalDataStore>('OperationalDataStore', ['activateQueue', 'refresh']);
  store.activateQueue.and.returnValue(() => undefined);
  return Object.assign(store, { queue: queue.asReadonly() });
}

describe('MyWorkPageComponent', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('activates the real adjuster UUID and marks the golden journey claim', async () => {
    sessionStorage.setItem('claimsflow.demoAdjusterId', 'adjuster-jordan');
    sessionStorage.setItem('claimsflow.demoClaimId', 'claim-demo');
    const store = createStore();

    await TestBed.configureTestingModule({
      imports: [MyWorkPageComponent],
      providers: [provideRouter([]), { provide: OperationalDataStore, useValue: store }],
    }).compileComponents();

    const fixture = TestBed.createComponent(MyWorkPageComponent);
    fixture.detectChanges();

    expect(store.activateQueue).toHaveBeenCalledWith(jasmine.objectContaining({
      adjusterId: 'adjuster-jordan',
      sort: 'slaDeadline,asc',
    }));
    expect(fixture.nativeElement.textContent).toContain('Taylor Reed');
    expect(fixture.nativeElement.textContent).toContain('Golden journey');
    expect(fixture.nativeElement.textContent).toContain('API-backed');
    expect(fixture.nativeElement.textContent).toContain('Southeast');
    expect(fixture.nativeElement.querySelector('.state-changed')).not.toBeNull();
  });

  it('explains how to resolve the adjuster when the demo has not been reset', async () => {
    const store = createStore({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });
    await TestBed.configureTestingModule({
      imports: [MyWorkPageComponent],
      providers: [provideRouter([]), { provide: OperationalDataStore, useValue: store }],
    }).compileComponents();

    const fixture = TestBed.createComponent(MyWorkPageComponent);
    fixture.detectChanges();

    expect(store.activateQueue).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Reset the golden journey');
  });

  it('forwards a manual refresh to the shared queue family', async () => {
    sessionStorage.setItem('claimsflow.demoAdjusterId', 'adjuster-jordan');
    const store = createStore();
    await TestBed.configureTestingModule({
      imports: [MyWorkPageComponent],
      providers: [provideRouter([]), { provide: OperationalDataStore, useValue: store }],
    }).compileComponents();

    const fixture = TestBed.createComponent(MyWorkPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.refresh();
    expect(store.refresh).toHaveBeenCalledWith('queue');
  });
});
