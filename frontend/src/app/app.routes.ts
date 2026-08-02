import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell.component';

const shell = (shellTitle: string, shellSubtitle: string) => ({ shellTitle, shellSubtitle });

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
        title: 'Executive Overview | ClaimsFlow',
        data: shell('Executive Overview', 'Operations performance at a glance.'),
      },
      {
        path: 'claims',
        loadComponent: () => import('./claims/feature-queue/claims-queue-page.component').then(m => m.ClaimsQueuePageComponent),
        title: 'Claim Queue | ClaimsFlow',
        data: shell('Claim Queue', 'Prioritized work, ownership, and SLA pressure.'),
      },
      {
        path: 'claims/new',
        loadComponent: () => import('./claims/feature-create/new-claim-page.component').then(m => m.NewClaimPageComponent),
        title: 'New Claim | ClaimsFlow',
        data: shell('New Claim', 'Guided intake with evidence-ready validation.'),
      },
      {
        path: 'claims/:id',
        loadComponent: () => import('./claims/feature-detail/claim-detail-page.component').then(m => m.ClaimDetailPageComponent),
        title: 'Claim Workspace | ClaimsFlow',
        data: shell('Claim Workspace', 'Evidence, decisions, workflow, and audit context.'),
      },
      {
        path: 'my-work',
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.MyWorkPageComponent),
        title: 'My Work | ClaimsFlow',
        data: shell('My Work', 'Personal queue, focus blocks, and daily commitments.'),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.AnalyticsPageComponent),
        title: 'Analytics & Reporting | ClaimsFlow',
        data: shell('Analytics & Reporting', 'Performance, trends, and operational excellence.'),
      },
      {
        path: 'intelligence',
        loadComponent: () => import('./intelligence/claims-intelligence-page.component').then(m => m.ClaimsIntelligencePageComponent),
        title: 'AI Insights | ClaimsFlow',
        data: shell('AI Insights', 'Risk, fraud, evidence, and decision intelligence.'),
      },
      {
        path: 'documents',
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.DocumentsPageComponent),
        title: 'Documents & Communications | ClaimsFlow',
        data: shell('Documents & Communications', 'Manage claim evidence and correspondence.'),
      },
      {
        path: 'team-ops',
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.TeamOperationsPageComponent),
        title: 'Team Operations & SLA Management | ClaimsFlow',
        data: shell('Team Operations & SLA Management', 'Real-time capacity and SLA command center.'),
      },
      {
        path: 'workflows',
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.WorkflowsPageComponent),
        title: 'Workflow Automation & Rules Builder | ClaimsFlow',
        data: shell('Workflow Automation & Rules Builder', 'Design and validate claims orchestration.'),
      },
      {
        path: 'reports',
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.ReportsPageComponent),
        title: 'Reports | ClaimsFlow',
        data: shell('Reports', 'Scheduled reporting and executive-ready exports.'),
      },
      {
        path: 'settings',
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.SettingsPageComponent),
        title: 'Settings | ClaimsFlow',
        data: shell('Settings', 'Workspace configuration, governance, and integrations.'),
      },
    ],
  },
  { path: 'dashboard', pathMatch: 'full', redirectTo: 'app/dashboard' },
  { path: 'claims/new', pathMatch: 'full', redirectTo: 'app/claims/new' },
  { path: 'claims/:id', redirectTo: 'app/claims/:id' },
  { path: 'claims', pathMatch: 'full', redirectTo: 'app/claims' },
  { path: '**', redirectTo: '' },
];
