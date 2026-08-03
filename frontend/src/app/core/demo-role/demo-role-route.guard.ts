import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DEMO_ROLES, DemoRoleId, parseDemoRole } from './demo-role.model';
import { DemoRoleService } from './demo-role.service';

export const demoRoleRouteGuard: CanActivateFn = (route, state) => {
  const roleService = inject(DemoRoleService);
  const router = inject(Router);
  const allowedRoles = (route.data?.['allowedDemoRoles'] as readonly DemoRoleId[] | undefined) ?? [];

  if (allowedRoles.length === 0) return true;

  const queryValue = router.parseUrl(state.url).queryParams['role'];
  const requestedRole = parseDemoRole(typeof queryValue === 'string' ? queryValue : null);
  const activeRole = requestedRole ?? roleService.role();

  if (allowedRoles.includes(activeRole)) return true;

  const owner = allowedRoles[0];
  roleService.recordBlockedRoute(owner);
  return router.createUrlTree([DEMO_ROLES[activeRole].defaultRoute], {
    queryParams: { role: activeRole },
  });
};
