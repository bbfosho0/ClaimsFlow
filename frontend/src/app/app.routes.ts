import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) },
  { path: 'claims', loadComponent: () => import('./claims/feature-queue/claims-queue-page.component').then(m => m.ClaimsQueuePageComponent) },
  { path: 'claims/new', loadComponent: () => import('./claims/feature-create/new-claim-page.component').then(m => m.NewClaimPageComponent) },
  { path: 'claims/:id', loadComponent: () => import('./claims/feature-detail/claim-detail-page.component').then(m => m.ClaimDetailPageComponent) },
  { path: '**', redirectTo: 'dashboard' },
];
