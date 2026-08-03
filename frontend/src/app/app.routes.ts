import { Routes } from '@angular/router';
import { DemoRoleId } from './core/demo-role/demo-role.model';
import { demoRoleRouteGuard } from './core/demo-role/demo-role-route.guard';
import { AppShellComponent } from './core/layout/app-shell.component';

const shell = (
  shellTitle: string,
  shellSubtitle: string,
  allowedDemoRoles: readonly DemoRoleId[],
) => ({ shellTitle, shellSubtitle, allowedDemoRoles });

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
    path: 'portal',
    loadComponent: () => import('./portal/layout/claimant-shell.component').then(m => m.ClaimantShellComponent),
    title: 'Claimant Portal | ClaimsFlow',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./portal/home/portal-home-page.component').then(m => m.PortalHomePageComponent),
        title: 'My Claim | ClaimsFlow',
      },
      {
        path: 'claims/new',
        loadComponent: () => import('./claims/feature-create/new-claim-page.component').then(m => m.NewClaimPageComponent),
        title: 'Start a Claim | ClaimsFlow',
      },
      {
        path: 'claims/:id',
        loadComponent: () => import('./portal/claim/portal-claim-page.component').then(m => m.PortalClaimPageComponent),
        title: 'Claim Status | ClaimsFlow',
      },
      {
        path: 'claims/:id/documents',
        loadComponent: () => import('./portal/documents/portal-documents-page.component').then(m => m.PortalDocumentsPageComponent),
        title: 'Claim Documents | ClaimsFlow',
      },
      {
        path: 'claims/:id/messages',
        loadComponent: () => import('./portal/messages/portal-messages-page.component').then(m => m.PortalMessagesPageComponent),
        title: 'Claim Messages | ClaimsFlow',
      },
    ],
  },
  {
    path: 'app',
    component: AppShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./dashboard/dashboard-page.component').then(m => m.DashboardPageComponent),
        title: 'Executive Overview | ClaimsFlow',
        data: shell('Executive Overview', 'Operations performance at a glance.', ['manager']),
      },
      {
        path: 'claims',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./claims/feature-queue/claims-queue-page.component').then(m => m.ClaimsQueuePageComponent),
        title: 'Claim Queue | ClaimsFlow',
        data: shell('Claim Queue', 'Prioritized work, ownership, and SLA pressure.', ['manager', 'adjuster']),
      },
      {
        path: 'claims/new',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./claims/feature-create/new-claim-page.component').then(m => m.NewClaimPageComponent),
        title: 'New Claim | ClaimsFlow',
        data: shell('New Claim', 'Guided intake with evidence-ready validation.', ['manager', 'adjuster']),
      },
      {
        path: 'claims/:id',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./claims/feature-detail/claim-detail-page.component').then(m => m.ClaimDetailPageComponent),
        title: 'Claim Workspace | ClaimsFlow',
        data: shell('Claim Workspace', 'Evidence, decisions, workflow, and audit context.', ['manager', 'adjuster']),
      },
      {
        path: 'my-work',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.MyWorkPageComponent),
        title: 'My Work | ClaimsFlow',
        data: shell('My Work', 'Personal queue, focus blocks, and daily commitments.', ['adjuster']),
      },
      {
        path: 'analytics',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.AnalyticsPageComponent),
        title: 'Analytics & Reporting | ClaimsFlow',
        data: shell('Analytics & Reporting', 'Performance, trends, and operational excellence.', ['manager']),
      },
      {
        path: 'intelligence',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./intelligence/claims-intelligence-page.component').then(m => m.ClaimsIntelligencePageComponent),
        title: 'AI Insights | ClaimsFlow',
        data: shell('AI Insights', 'Risk, fraud, evidence, and decision intelligence.', ['manager']),
      },
      {
        path: 'documents',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.DocumentsPageComponent),
        title: 'Documents & Communications | ClaimsFlow',
        data: shell('Documents & Communications', 'Manage claim evidence and correspondence.', ['adjuster']),
      },
      {
        path: 'team-ops',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.TeamOperationsPageComponent),
        title: 'Team Operations & SLA Management | ClaimsFlow',
        data: shell('Team Operations & SLA Management', 'Real-time capacity and SLA command center.', ['manager']),
      },
      {
        path: 'workflows',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.WorkflowsPageComponent),
        title: 'Workflow Automation & Rules Builder | ClaimsFlow',
        data: shell('Workflow Automation & Rules Builder', 'Design and validate claims orchestration.', ['admin']),
      },
      {
        path: 'reports',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.ReportsPageComponent),
        title: 'Reports | ClaimsFlow',
        data: shell('Reports', 'Scheduled reporting and executive-ready exports.', ['manager', 'adjuster', 'admin']),
      },
      {
        path: 'settings',
        canActivate: [demoRoleRouteGuard],
        loadComponent: () => import('./workspaces/workspace-pages.component').then(m => m.SettingsPageComponent),
        title: 'Settings | ClaimsFlow',
        data: shell('Settings', 'Workspace configuration, governance, and integrations.', ['admin']),
      },
    ],
  },
  { path: 'dashboard', pathMatch: 'full', redirectTo: 'app/dashboard' },
  { path: 'claims/new', pathMatch: 'full', redirectTo: 'app/claims/new' },
  { path: 'claims/:id', redirectTo: 'app/claims/:id' },
  { path: 'claims', pathMatch: 'full', redirectTo: 'app/claims' },
  { path: '**', redirectTo: '' },
];
