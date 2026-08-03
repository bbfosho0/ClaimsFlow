import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { DefaultUrlSerializer, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DEMO_ROLES, parseDemoRole } from './demo-role.model';
import { DemoRoleService } from './demo-role.service';

class FakeStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

class ThrowingStorage extends FakeStorage {
  override getItem(): string | null { throw new Error('storage unavailable'); }
  override setItem(): void { throw new Error('storage unavailable'); }
}

function configure(url: string, storage: Storage = new FakeStorage()) {
  const events = new Subject<NavigationEnd>();
  const serializer = new DefaultUrlSerializer();
  const router = {
    url,
    events,
    parseUrl: (value: string) => serializer.parse(value),
    navigate: jasmine.createSpy('navigate').and.resolveTo(true),
  };
  const document = { defaultView: { localStorage: storage } } as unknown as Document;

  TestBed.configureTestingModule({
    providers: [
      DemoRoleService,
      { provide: Router, useValue: router },
      { provide: DOCUMENT, useValue: document },
    ],
  });

  return { service: TestBed.inject(DemoRoleService), router, events, storage };
}

describe('demo role contract', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('parses only the supported employee roles', () => {
    expect(parseDemoRole('manager')).toBe('manager');
    expect(parseDemoRole('adjuster')).toBe('adjuster');
    expect(parseDemoRole('admin')).toBe('admin');
    expect(parseDemoRole('claimant')).toBeNull();
    expect(parseDemoRole(null)).toBeNull();
  });

  it('exposes only completed employer-facing navigation per role', () => {
    expect(DEMO_ROLES.manager.navigation.map(item => item.label)).toEqual([
      'Overview', 'Claim Queue', 'Analytics', 'AI Insights', 'Team Operations',
    ]);
    expect(DEMO_ROLES.adjuster.navigation.map(item => item.label)).toEqual([
      'My Work', 'Claim Queue', 'Evidence Operations',
    ]);
    expect(DEMO_ROLES.admin.navigation.map(item => item.label)).toEqual([
      'Workflow Automation',
    ]);

    const allIds = Object.values(DEMO_ROLES).flatMap(role => role.navigation.map(item => item.id));
    expect(allIds).not.toContain('reports');
    expect(allIds).not.toContain('settings');
  });

  it('uses a valid query role before stored state and persists it', () => {
    const storage = new FakeStorage();
    storage.setItem('claimsflow.demoRole', 'admin');
    const { service } = configure('/app/dashboard?role=adjuster', storage);

    expect(service.role()).toBe('adjuster');
    expect(storage.getItem('claimsflow.demoRole')).toBe('adjuster');
  });

  it('uses a valid stored role when the URL has no supported role', () => {
    const storage = new FakeStorage();
    storage.setItem('claimsflow.demoRole', 'admin');
    const { service } = configure('/app/dashboard', storage);

    expect(service.role()).toBe('admin');
  });

  it('falls back to manager for invalid values or unavailable storage', () => {
    const invalid = new FakeStorage();
    invalid.setItem('claimsflow.demoRole', 'claimant');
    expect(configure('/app/dashboard?role=customer', invalid).service.role()).toBe('manager');

    TestBed.resetTestingModule();
    expect(configure('/app/dashboard', new ThrowingStorage()).service.role()).toBe('manager');
  });

  it('switches roles through the approved default route', async () => {
    const { service, router, storage } = configure('/app/dashboard');

    await expectAsync(service.switchRole('admin')).toBeResolvedTo(true);

    expect(service.role()).toBe('admin');
    expect(storage.getItem('claimsflow.demoRole')).toBe('admin');
    expect(router.navigate).toHaveBeenCalledOnceWith(['/app/workflows'], {
      queryParams: { role: 'admin' },
    });
  });

  it('synchronizes a valid role after navigation', () => {
    const { service, events } = configure('/app/dashboard');

    events.next(new NavigationEnd(1, '/app/dashboard', '/app/my-work?role=adjuster'));

    expect(service.role()).toBe('adjuster');
  });

  it('records and consumes one role-ownership notice', () => {
    const { service } = configure('/app/dashboard?role=adjuster');

    service.recordBlockedRoute('manager');

    expect(service.consumeNotice()).toContain('Claims Manager');
    expect(service.consumeNotice()).toBeNull();
  });
});
