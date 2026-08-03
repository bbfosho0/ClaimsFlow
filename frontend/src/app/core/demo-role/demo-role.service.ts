import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DEMO_ROLES, DemoNavigationItem, DemoRoleDefinition, DemoRoleId, parseDemoRole } from './demo-role.model';

const STORAGE_KEY = 'claimsflow.demoRole';

@Injectable({ providedIn: 'root' })
export class DemoRoleService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly roleState = signal<DemoRoleId>(this.resolveInitialRole());
  private readonly noticeState = signal<string | null>(null);

  readonly role: Signal<DemoRoleId> = this.roleState.asReadonly();
  readonly definition: Signal<DemoRoleDefinition> = computed(() => DEMO_ROLES[this.roleState()]);
  readonly navigation: Signal<readonly DemoNavigationItem[]> = computed(() => this.definition().navigation);

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    ).subscribe(event => {
      const role = this.roleFromUrl(event.urlAfterRedirects);
      if (!role || role === this.roleState()) return;
      this.roleState.set(role);
      this.persist(role);
    });
  }

  async switchRole(role: DemoRoleId): Promise<boolean> {
    const parsed = parseDemoRole(role);
    if (!parsed) return false;

    this.roleState.set(parsed);
    this.persist(parsed);
    return this.router.navigate([DEMO_ROLES[parsed].defaultRoute], {
      queryParams: { role: parsed },
    });
  }

  recordBlockedRoute(owner: DemoRoleId): void {
    this.noticeState.set(
      `${DEMO_ROLES[owner].label} owns that destination in this demo. You are viewing ${this.definition().label}.`,
    );
  }

  consumeNotice(): string | null {
    const notice = this.noticeState();
    this.noticeState.set(null);
    return notice;
  }

  private resolveInitialRole(): DemoRoleId {
    const queryRole = this.roleFromUrl(this.router.url);
    if (queryRole) {
      this.persist(queryRole);
      return queryRole;
    }

    const storedRole = this.readStoredRole();
    return storedRole ?? 'manager';
  }

  private roleFromUrl(url: string): DemoRoleId | null {
    try {
      const value = this.router.parseUrl(url).queryParams['role'];
      return parseDemoRole(typeof value === 'string' ? value : null);
    } catch {
      return null;
    }
  }

  private readStoredRole(): DemoRoleId | null {
    try {
      return parseDemoRole(this.storage?.getItem(STORAGE_KEY) ?? null);
    } catch {
      return null;
    }
  }

  private persist(role: DemoRoleId): void {
    try {
      this.storage?.setItem(STORAGE_KEY, role);
    } catch {
      // Demo-role persistence is optional and must never block navigation.
    }
  }

  private get storage(): Storage | null {
    return this.document.defaultView?.localStorage ?? null;
  }
}
