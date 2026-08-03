import { Route, Routes } from '@angular/router';
import { DemoRoleId } from './core/demo-role/demo-role.model';
import { routes } from './app.routes';

function flattenRoutes(items: Routes, prefix = ''): Map<string, Route> {
  const flattened = new Map<string, Route>();
  for (const route of items) {
    const fullPath = [prefix, route.path].filter(Boolean).join('/');
    flattened.set(fullPath, route);
    if (route.children) {
      for (const [path, child] of flattenRoutes(route.children, fullPath)) flattened.set(path, child);
    }
  }
  return flattened;
}

function allowed(byPath: Map<string, Route>, path: string): readonly DemoRoleId[] {
  return byPath.get(path)?.data?.['allowedDemoRoles'] as readonly DemoRoleId[];
}

describe('ClaimsFlow route contract', () => {
  it('exposes the showcase, tour, claimant portal, and completed employee workspaces', () => {
    const byPath = flattenRoutes(routes);

    expect(byPath.get('')?.loadComponent).toBeDefined();
    expect(byPath.get('showcase')?.redirectTo).toBe('');
    expect(byPath.get('tour')?.loadComponent).toBeDefined();

    const portalRoutes = [
      'portal',
      'portal/claims/new',
      'portal/claims/:id',
      'portal/claims/:id/documents',
      'portal/claims/:id/messages',
    ];
    for (const path of portalRoutes) {
      expect(byPath.get(path)?.loadComponent).withContext(path).toBeDefined();
      expect(byPath.get(path)?.canActivate).withContext(`${path} no role guard`).toBeUndefined();
    }

    const applicationRoutes = [
      'app/dashboard',
      'app/claims',
      'app/claims/new',
      'app/claims/:id',
      'app/my-work',
      'app/analytics',
      'app/intelligence',
      'app/documents',
      'app/team-ops',
      'app/workflows',
    ];

    for (const path of applicationRoutes) {
      expect(byPath.get(path)?.loadComponent).withContext(path).toBeDefined();
      expect(byPath.get(path)?.canActivate?.length).withContext(`${path} guard`).toBe(1);
      expect(byPath.get(path)?.data?.['shellTitle']).withContext(`${path} title`).toBeTruthy();
      expect(byPath.get(path)?.data?.['shellSubtitle']).withContext(`${path} subtitle`).toBeTruthy();
    }
  });

  it('does not expose source-only placeholder routes', () => {
    const byPath = flattenRoutes(routes);

    expect(byPath.has('app/reports')).toBeFalse();
    expect(byPath.has('app/settings')).toBeFalse();
  });

  it('assigns each permanent workspace to the approved demo roles', () => {
    const byPath = flattenRoutes(routes);

    expect(allowed(byPath, 'app/dashboard')).toEqual(['manager']);
    expect(allowed(byPath, 'app/analytics')).toEqual(['manager']);
    expect(allowed(byPath, 'app/intelligence')).toEqual(['manager']);
    expect(allowed(byPath, 'app/team-ops')).toEqual(['manager']);

    expect(allowed(byPath, 'app/my-work')).toEqual(['adjuster']);
    expect(allowed(byPath, 'app/documents')).toEqual(['adjuster']);

    expect(allowed(byPath, 'app/claims')).toEqual(['manager', 'adjuster']);
    expect(allowed(byPath, 'app/claims/new')).toEqual(['manager', 'adjuster']);
    expect(allowed(byPath, 'app/claims/:id')).toEqual(['manager', 'adjuster']);

    expect(allowed(byPath, 'app/workflows')).toEqual(['admin']);
  });

  it('keeps legacy application URLs as redirects', () => {
    const byPath = flattenRoutes(routes);

    expect(byPath.get('dashboard')?.redirectTo).toBe('app/dashboard');
    expect(byPath.get('claims')?.redirectTo).toBe('app/claims');
    expect(byPath.get('claims/new')?.redirectTo).toBe('app/claims/new');
    expect(byPath.get('claims/:id')?.redirectTo).toBe('app/claims/:id');
  });
});
