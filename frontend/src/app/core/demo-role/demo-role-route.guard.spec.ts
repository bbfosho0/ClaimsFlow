import { Signal, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { DEMO_ROLES, DemoRoleDefinition, DemoRoleId } from './demo-role.model';
import { demoRoleRouteGuard } from './demo-role-route.guard';
import { DemoRoleService } from './demo-role.service';

describe('demoRoleRouteGuard', () => {
  const activeRole = signal<DemoRoleId>('manager');
  const recordBlockedRoute = jasmine.createSpy('recordBlockedRoute');
  const fakeService = {
    role: activeRole.asReadonly(),
    definition: computed(() => DEMO_ROLES[activeRole()]) as Signal<DemoRoleDefinition>,
    recordBlockedRoute,
  };

  beforeEach(() => {
    activeRole.set('manager');
    recordBlockedRoute.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: DemoRoleService, useValue: fakeService },
      ],
    });
  });

  function runGuard(allowedDemoRoles: readonly DemoRoleId[], url: string): boolean | UrlTree {
    const route = { data: { allowedDemoRoles } } as unknown as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => demoRoleRouteGuard(route, state)) as boolean | UrlTree;
  }

  it('allows a manager to open Analytics', () => {
    expect(runGuard(['manager'], '/app/analytics?role=manager')).toBeTrue();
  });

  it('uses the direct-link role query before the stored role', () => {
    activeRole.set('manager');
    expect(runGuard(['adjuster'], '/app/my-work?role=adjuster')).toBeTrue();
  });

  it('redirects an adjuster away from Analytics and records its owner', () => {
    activeRole.set('adjuster');
    const router = TestBed.inject(Router);
    const result = runGuard(['manager'], '/app/analytics?role=adjuster') as UrlTree;

    expect(router.serializeUrl(result)).toBe('/app/my-work?role=adjuster');
    expect(recordBlockedRoute).toHaveBeenCalledOnceWith('manager');
  });

  it('redirects an administrator away from Claim Workspace', () => {
    activeRole.set('admin');
    const router = TestBed.inject(Router);
    const result = runGuard(['manager', 'adjuster'], '/app/claims/claim-1?role=admin') as UrlTree;

    expect(router.serializeUrl(result)).toBe('/app/workflows?role=admin');
    expect(recordBlockedRoute).toHaveBeenCalledOnceWith('manager');
  });

  it('allows both manager and adjuster roles to open Claim Workspace', () => {
    activeRole.set('manager');
    expect(runGuard(['manager', 'adjuster'], '/app/claims/claim-1?role=manager')).toBeTrue();

    activeRole.set('adjuster');
    expect(runGuard(['manager', 'adjuster'], '/app/claims/claim-1?role=adjuster')).toBeTrue();
  });
});
