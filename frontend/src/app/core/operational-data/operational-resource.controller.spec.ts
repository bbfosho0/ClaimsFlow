import { OperationalResourceController } from './operational-resource.controller';

describe('OperationalResourceController', () => {
  it('distinguishes initial loading from background refresh', () => {
    const controller = new OperationalResourceController<{ count: number }>();

    controller.begin(false);
    expect(controller.state().loading).toBeTrue();
    expect(controller.state().refreshing).toBeFalse();

    controller.succeed({ count: 2 }, new Date('2026-08-03T12:00:00Z'));
    controller.begin(true);
    expect(controller.state().value).toEqual({ count: 2 });
    expect(controller.state().loading).toBeFalse();
    expect(controller.state().refreshing).toBeTrue();
  });

  it('retains the last valid value and marks it stale after failure', () => {
    const controller = new OperationalResourceController<{ count: number }>();
    controller.succeed({ count: 4 });

    controller.begin(true);
    controller.fail('temporarily unavailable');

    expect(controller.state().value).toEqual({ count: 4 });
    expect(controller.state().stale).toBeTrue();
    expect(controller.state().error).toBe('temporarily unavailable');
  });

  it('clears stale and error state after success', () => {
    const controller = new OperationalResourceController<{ count: number }>();
    controller.succeed({ count: 1 });
    controller.fail('offline');
    controller.succeed({ count: 3 });

    expect(controller.state().value).toEqual({ count: 3 });
    expect(controller.state().stale).toBeFalse();
    expect(controller.state().error).toBe('');
  });

  it('deduplicates and clears changed claim IDs', () => {
    const controller = new OperationalResourceController<unknown>();
    controller.markClaimsChanged(['a', 'b', 'a']);
    expect(controller.state().changedClaimIds).toEqual(['a', 'b']);

    controller.clearClaimsChanged(['a']);
    expect(controller.state().changedClaimIds).toEqual(['b']);
  });
});
