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
  it('exposes the showcase, tour, and five lazy application destinations', () => {
    const byPath = flattenRoutes(routes);

    expect(byPath.get('')?.loadComponent).toBeDefined();
    expect(byPath.get('showcase')?.redirectTo).toBe('');
    expect(byPath.get('tour')?.loadComponent).toBeDefined();
    expect(byPath.get('app/dashboard')?.loadComponent).toBeDefined();
    expect(byPath.get('app/claims')?.loadComponent).toBeDefined();
    expect(byPath.get('app/claims/new')?.loadComponent).toBeDefined();
    expect(byPath.get('app/claims/:id')?.loadComponent).toBeDefined();
    expect(byPath.get('app/intelligence')?.loadComponent).toBeDefined();
  });

  it('keeps legacy application URLs as redirects', () => {
    const byPath = flattenRoutes(routes);

    expect(byPath.get('dashboard')?.redirectTo).toBe('app/dashboard');
    expect(byPath.get('claims')?.redirectTo).toBe('app/claims');
    expect(byPath.get('claims/new')?.redirectTo).toBe('app/claims/new');
    expect(byPath.get('claims/:id')?.redirectTo).toBe('app/claims/:id');
  });
});
