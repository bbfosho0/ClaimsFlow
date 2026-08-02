import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs';

interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
  readonly exact?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly shellTitle = signal('Executive Overview');
  readonly shellSubtitle = signal('Operations performance at a glance.');
  readonly mobileDrawerOpen = signal(false);

  readonly navigation: readonly NavigationItem[] = [
    { label: 'Overview', path: '/app/dashboard', icon: '◉' },
    { label: 'Claim Queue', path: '/app/claims', icon: '☷', exact: true },
    { label: 'New Claim', path: '/app/claims/new', icon: '+' },
    { label: 'My Work', path: '/app/my-work', icon: '✓' },
    { label: 'Analytics', path: '/app/analytics', icon: '⌁' },
    { label: 'AI Insights', path: '/app/intelligence', icon: '✦' },
    { label: 'Documents', path: '/app/documents', icon: '▤' },
    { label: 'Team Ops', path: '/app/team-ops', icon: '◎' },
    { label: 'Workflows', path: '/app/workflows', icon: '◇' },
    { label: 'Reports', path: '/app/reports', icon: '▥' },
    { label: 'Settings', path: '/app/settings', icon: '⚙' },
  ];

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.syncRouteContext());
  }

  toggleMobileDrawer(): void {
    this.mobileDrawerOpen.update(open => !open);
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }

  private syncRouteContext(): void {
    let current = this.route;
    while (current.firstChild) current = current.firstChild;
    const data = current.snapshot.data;
    this.shellTitle.set(data['shellTitle'] ?? 'Executive Overview');
    this.shellSubtitle.set(data['shellSubtitle'] ?? 'Operations performance at a glance.');
  }
}
