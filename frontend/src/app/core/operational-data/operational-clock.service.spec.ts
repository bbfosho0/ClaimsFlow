import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OperationalClockService } from './operational-clock.service';

describe('OperationalClockService', () => {
  let service: OperationalClockService;
  let visibility: DocumentVisibilityState;

  beforeEach(() => {
    visibility = 'visible';
    spyOnProperty(document, 'visibilityState', 'get').and.callFake(() => visibility);
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperationalClockService);
  });

  afterEach(() => service.ngOnDestroy());

  it('updates every 30 seconds while visible', fakeAsync(() => {
    const initial = service.now();
    tick(29_999);
    expect(service.now()).toBe(initial);

    tick(1);
    expect(service.now()).toBeGreaterThanOrEqual(initial + 30_000);
  }));

  it('pauses while hidden and refreshes immediately when visible again', fakeAsync(() => {
    const initial = service.now();
    visibility = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));

    tick(60_000);
    expect(service.now()).toBe(initial);

    visibility = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(service.now()).toBeGreaterThanOrEqual(initial + 60_000);
  }));

  it('removes its timer when destroyed', fakeAsync(() => {
    const initial = service.now();
    service.ngOnDestroy();
    tick(60_000);
    expect(service.now()).toBe(initial);
  }));
});
