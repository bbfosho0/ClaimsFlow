import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./showcase/showcase-page.component').then(m => m.ShowcasePageComponent),
    title: 'ClaimsFlow | Audit-ready claims operations',
  },
  { path: 'showcase', pathMatch: 'full', redirectTo: '' },
  {
    path: 'tour',
    loadComponent: () => import('./tour/tour-page.component').then(m => m.TourPageComponent),
    title: 'ClaimsFlow guided tour',
  },
  {
    path: 'app',
    component: AppShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard-page.component').then(m => m.DashboardPageComponent),
        title: 'Operations Overview | ClaimsFlow',
      },
      {
        path: 'claims',
        loadComponent: () => import('./claims/feature-queue/claims-queue-page.component').then(m => m.ClaimsQueuePageComponent),
        title: 'Claims Queue | ClaimsFlow',
      },
      {
        path: 'claims/new',
        loadComponent: () => import('./claims/feature-create/new-claim-page.component').then(m => m.NewClaimPageComponent),
        title: 'New Claim | ClaimsFlow',
      },
      {
        path: 'claims/:id',
        loadComponent: () => import('./claims/feature-detail/claim-detail-page.component').then(m => m.ClaimDetailPageComponent),
        title: 'Claim Workspace | ClaimsFlow',
      },
      {
        path: 'intelligence',
        loadComponent: () => import('./intelligence/claims-intelligence-page.component').then(m => m.ClaimsIntelligencePageComponent),
        title: 'Claims Intelligence | ClaimsFlow',
      },
    ],
  },
  { path: 'dashboard', pathMatch: 'full', redirectTo: 'app/dashboard' },
  { path: 'claims/new', pathMatch: 'full', redirectTo: 'app/claims/new' },
  { path: 'claims/:id', redirectTo: 'app/claims/:id' },
  { path: 'claims', pathMatch: 'full', redirectTo: 'app/claims' },
  { path: '**', redirectTo: '' },
];
