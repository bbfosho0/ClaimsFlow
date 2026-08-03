export type DemoRoleId = 'manager' | 'adjuster' | 'admin';

export interface DemoNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

export interface DemoRoleDefinition {
  readonly id: DemoRoleId;
  readonly label: string;
  readonly personaName: string;
  readonly personaTitle: string;
  readonly initials: string;
  readonly defaultRoute: string;
  readonly navigation: readonly DemoNavigationItem[];
  readonly contextualPrefixes: readonly string[];
}

export const DEMO_ROLES: Record<DemoRoleId, DemoRoleDefinition> = {
  manager: {
    id: 'manager',
    label: 'Claims Manager',
    personaName: 'Alex Morgan',
    personaTitle: 'Claims Manager',
    initials: 'AM',
    defaultRoute: '/app/dashboard',
    navigation: [
      { id: 'overview', label: 'Overview', path: '/app/dashboard', icon: '◉' },
      { id: 'queue', label: 'Claim Queue', path: '/app/claims', icon: '☷' },
      { id: 'analytics', label: 'Analytics', path: '/app/analytics', icon: '⌁' },
      { id: 'intelligence', label: 'AI Insights', path: '/app/intelligence', icon: '✦' },
      { id: 'team-ops', label: 'Team Operations', path: '/app/team-ops', icon: '◎' },
    ],
    contextualPrefixes: ['/app/claims/'],
  },
  adjuster: {
    id: 'adjuster',
    label: 'Adjuster',
    personaName: 'Jordan Lee',
    personaTitle: 'Senior Adjuster',
    initials: 'JL',
    defaultRoute: '/app/my-work',
    navigation: [
      { id: 'my-work', label: 'My Work', path: '/app/my-work', icon: '✓' },
      { id: 'queue', label: 'Claim Queue', path: '/app/claims', icon: '☷' },
      { id: 'documents', label: 'Evidence Operations', path: '/app/documents', icon: '▤' },
    ],
    contextualPrefixes: ['/app/claims/'],
  },
  admin: {
    id: 'admin',
    label: 'Administrator',
    personaName: 'Priya Shah',
    personaTitle: 'Platform Administrator',
    initials: 'PS',
    defaultRoute: '/app/workflows',
    navigation: [
      { id: 'workflows', label: 'Workflow Automation', path: '/app/workflows', icon: '◇' },
    ],
    contextualPrefixes: [],
  },
};

export function parseDemoRole(value: string | null): DemoRoleId | null {
  return value === 'manager' || value === 'adjuster' || value === 'admin' ? value : null;
}
