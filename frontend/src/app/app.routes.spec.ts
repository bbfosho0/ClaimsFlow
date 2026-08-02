import { Route, Routes } from '@angular/router';
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

describe('ClaimsFlow route contract', () => {
  it('exposes the showcase, tour, nine production workspaces, and three secondary destinations', () => {
    const byPath = flattenRoutes(routes);

    expect(byPath.get('')?.loadComponent).toBeDefined();
    expect(byPath.get('showcase')?.redirectTo).toBe('');
    expect(byPath.get('tour')?.loadComponent).toBeDefined();

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
      'app/reports',
      'app/settings',
    ];

    for (const path of applicationRoutes) {
      expect(byPath.get(path)?.loadComponent).withContext(path).toBeDefined();
      expect(byPath.get(path)?.data?.['shellTitle']).withContext(`${path} title`).toBeTruthy();
      expect(byPath.get(path)?.data?.['shellSubtitle']).withContext(`${path} subtitle`).toBeTruthy();
    }
  });

  it('keeps legacy application URLs as redirects', () => {
    const byPath = flattenRoutes(routes);

    expect(byPath.get('dashboard')?.redirectTo).toBe('app/dashboard');
    expect(byPath.get('claims')?.redirectTo).toBe('app/claims');
    expect(byPath.get('claims/new')?.redirectTo).toBe('app/claims/new');
    expect(byPath.get('claims/:id')?.redirectTo).toBe('app/claims/:id');
  });
});
