import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { DemoJourneySnapshot } from '../../demo/demo-journey.models';
import { DemoResetDialogComponent } from '../../demo/demo-reset-dialog.component';
import { DemoRoleService } from '../demo-role/demo-role.service';
import { CopilotOrbComponent } from '../effects/copilot-orb.component';
import { RoleSwitcherComponent } from './role-switcher/role-switcher.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, RoleSwitcherComponent, DemoResetDialogComponent, CopilotOrbComponent],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.css', './app-shell-role-aware.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly demoRole = inject(DemoRoleService);

  readonly shellTitle = signal('Executive Overview');
  readonly shellSubtitle = signal('Operations performance at a glance.');
  readonly mobileDrawerOpen = signal(false);
  readonly roleNotice = signal<string | null>(null);
  readonly resetDialogOpen = signal(false);
  readonly navigation = this.demoRole.navigation;
  readonly operator = this.demoRole.definition;
  readonly mobileSecondaryNavigation = computed(() => this.navigation().slice(4));

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

  dismissRoleNotice(): void {
    this.roleNotice.set(null);
  }

  openClaimantPortal(): void {
    void this.router.navigate(['/portal']);
  }

  requestDemoReset(): void {
    this.resetDialogOpen.set(true);
  }

  closeDemoReset(): void {
    this.resetDialogOpen.set(false);
  }

  completeDemoReset(_snapshot: DemoJourneySnapshot): void {
    this.resetDialogOpen.set(false);
    this.roleNotice.set('Demo journey reset.');
  }

  private syncRouteContext(): void {
    let current = this.route;
    while (current.firstChild) current = current.firstChild;
    const data = current.snapshot.data;
    this.shellTitle.set(data['shellTitle'] ?? 'Executive Overview');
    this.shellSubtitle.set(data['shellSubtitle'] ?? 'Operations performance at a glance.');
    const notice = this.demoRole.consumeNotice();
    if (notice) this.roleNotice.set(notice);
    this.closeMobileDrawer();
  }
}
