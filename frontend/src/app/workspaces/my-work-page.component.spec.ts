import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OperationalDataStore } from '../core/operational-data/operational-data.store';
import { MyWorkSnapshot, OperationalResource } from '../core/operational-data/operational-data.models';
import { MyWorkPageComponent } from './my-work-page.component';

const snapshot: MyWorkSnapshot = {
  generatedAt: '2026-08-03T12:00:00Z',
  adjusterId: 'adjuster-jordan',
  displayName: 'Jordan Lee',
  team: 'Claims Operations',
  capacity: 12,
  activeClaims: 1,
  dueWithin24Hours: 1,
  overdueClaims: 0,
  evidenceBlockedClaims: 1,
  utilizationPercentage: 8,
  workloadTrend: [{ date: '2026-08-03', activeClaims: 1 }],
  timeline: [{
    claimId: 'claim-demo', claimNumber: 'CLM-2026-DEMO', claimantName: 'Taylor Reed',
    priority: 'HIGH', status: 'UNDER_REVIEW', slaDeadline: '2026-08-03T18:00:00Z',
    completenessPercentage: 50, group: 'NOW', reason: 'Evidence remains incomplete.', tone: 'warning',
  }],
  claims: [{
    id: 'claim-demo', claimNumber: 'CLM-2026-DEMO', claimantName: 'Taylor Reed', claimType: 'PROPERTY',
    region: 'SOUTHEAST', priority: 'HIGH', status: 'UNDER_REVIEW', slaDeadline: '2026-08-03T18:00:00Z',
    completenessPercentage: 50, createdAt: '2026-08-03T05:00:00Z', updatedAt: '2026-08-03T06:00:00Z',
  }],
};

function resource(value: MyWorkSnapshot | null): OperationalResource<MyWorkSnapshot> {
  return { value, loading: false, refreshing: false, stale: false, error: '', updatedAt: value ? new Date('2026-08-03T12:00:00Z') : null, changedClaimIds: ['claim-demo'] };
}

function createStore(value: MyWorkSnapshot | null = snapshot): any {
  const store = jasmine.createSpyObj<OperationalDataStore>('OperationalDataStore', ['activateMyWork', 'refresh']);
  store.activateMyWork.and.returnValue(() => undefined);
  return Object.assign(store, { myWork: signal(resource(value)).asReadonly() });
}

describe('MyWorkPageComponent', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('activates the dedicated adjuster snapshot and marks the golden journey claim', async () => {
    sessionStorage.setItem('claimsflow.demoAdjusterId', 'adjuster-jordan');
    sessionStorage.setItem('claimsflow.demoClaimId', 'claim-demo');
    const store = createStore();
    await TestBed.configureTestingModule({ imports: [MyWorkPageComponent], providers: [provideRouter([]), { provide: OperationalDataStore, useValue: store }] }).compileComponents();
    const fixture = TestBed.createComponent(MyWorkPageComponent);
    fixture.detectChanges();
    expect(store.activateMyWork).toHaveBeenCalledWith('adjuster-jordan');
    expect(fixture.nativeElement.textContent).toContain('Taylor Reed');
    expect(fixture.nativeElement.textContent).toContain('Golden journey');
    expect(fixture.nativeElement.textContent).toContain('Southeast');
    expect(fixture.nativeElement.querySelector('.state-changed')).not.toBeNull();
  });

  it('explains how to resolve the adjuster when the demo has not been reset', async () => {
    const store = createStore(null);
    await TestBed.configureTestingModule({ imports: [MyWorkPageComponent], providers: [provideRouter([]), { provide: OperationalDataStore, useValue: store }] }).compileComponents();
    const fixture = TestBed.createComponent(MyWorkPageComponent);
    fixture.detectChanges();
    expect(store.activateMyWork).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Reset the golden journey');
  });

  it('forwards a manual refresh to the shared My Work family', async () => {
    sessionStorage.setItem('claimsflow.demoAdjusterId', 'adjuster-jordan');
    const store = createStore();
    await TestBed.configureTestingModule({ imports: [MyWorkPageComponent], providers: [provideRouter([]), { provide: OperationalDataStore, useValue: store }] }).compileComponents();
    const fixture = TestBed.createComponent(MyWorkPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.refresh();
    expect(store.refresh).toHaveBeenCalledWith('myWork');
  });
});
