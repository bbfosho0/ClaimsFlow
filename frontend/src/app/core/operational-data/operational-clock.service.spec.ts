import { fakeAsync, tick } from '@angular/core/testing';
import { OperationalClockService } from './operational-clock.service';

describe('OperationalClockService', () => {
  let service: OperationalClockService | null;
  let visibility: DocumentVisibilityState;
  let now: number;

  beforeEach(() => {
    service = null;
    visibility = 'visible';
    now = 1_000;
    spyOn(Date, 'now').and.callFake(() => now);
    spyOnProperty(document, 'visibilityState', 'get').and.callFake(() => visibility);
  });

  afterEach(() => service?.ngOnDestroy());

  it('updates every 30 seconds while visible', fakeAsync(() => {
    service = new OperationalClockService();
    expect(service.now()).toBe(1_000);

    now = 30_999;
    tick(29_999);
    expect(service.now()).toBe(1_000);

    now = 31_000;
    tick(1);
    expect(service.now()).toBe(31_000);
  }));

  it('pauses while hidden and refreshes immediately when visible again', fakeAsync(() => {
    service = new OperationalClockService();
    visibility = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));

    now = 61_000;
    tick(60_000);
    expect(service.now()).toBe(1_000);

    visibility = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(service.now()).toBe(61_000);
  }));

  it('removes its timer when destroyed', fakeAsync(() => {
    service = new OperationalClockService();
    service.ngOnDestroy();
    now = 61_000;
    tick(60_000);
    expect(service.now()).toBe(1_000);
  }));
});
