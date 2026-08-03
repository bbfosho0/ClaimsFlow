import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OperationalPollCoordinator } from './operational-poll-coordinator.service';

describe('OperationalPollCoordinator', () => {
  let coordinator: OperationalPollCoordinator;
  let visibility: DocumentVisibilityState;

  beforeEach(() => {
    visibility = 'visible';
    spyOnProperty(document, 'visibilityState', 'get').and.callFake(() => visibility);
    TestBed.configureTestingModule({});
    coordinator = TestBed.inject(OperationalPollCoordinator);
  });

  afterEach(() => coordinator.ngOnDestroy());

  it('uses one timer for every active resource', fakeAsync(() => {
    const dashboard = jasmine.createSpy('dashboard');
    const analytics = jasmine.createSpy('analytics');
    const releaseDashboard = coordinator.register('dashboard', dashboard);
    const releaseAnalytics = coordinator.register('analytics', analytics);

    tick(44_999);
    expect(dashboard).not.toHaveBeenCalled();
    expect(analytics).not.toHaveBeenCalled();

    tick(1);
    expect(dashboard).toHaveBeenCalledTimes(1);
    expect(analytics).toHaveBeenCalledTimes(1);

    releaseDashboard();
    tick(45_000);
    expect(dashboard).toHaveBeenCalledTimes(1);
    expect(analytics).toHaveBeenCalledTimes(2);
    releaseAnalytics();
  }));

  it('reference counts duplicate registrations', fakeAsync(() => {
    const refresh = jasmine.createSpy('refresh');
    const releaseFirst = coordinator.register('dashboard', refresh);
    const releaseSecond = coordinator.register('dashboard', refresh);

    releaseFirst();
    tick(45_000);
    expect(refresh).toHaveBeenCalledTimes(1);

    releaseSecond();
    tick(45_000);
    expect(refresh).toHaveBeenCalledTimes(1);
  }));

  it('pauses while hidden and refreshes immediately when visible', fakeAsync(() => {
    const refresh = jasmine.createSpy('refresh');
    const release = coordinator.register('dashboard', refresh);

    visibility = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    tick(90_000);
    expect(refresh).not.toHaveBeenCalled();

    visibility = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(refresh).toHaveBeenCalledTimes(1);

    release();
  }));
});
