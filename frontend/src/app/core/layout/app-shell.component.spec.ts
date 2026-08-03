import { Signal, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DEMO_ROLES, DemoRoleDefinition, DemoRoleId } from '../demo-role/demo-role.model';
import { DemoRoleService } from '../demo-role/demo-role.service';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  const roleState = signal<DemoRoleId>('manager');
  const fakeRoleService = {
    role: roleState.asReadonly(),
    definition: computed(() => DEMO_ROLES[roleState()]) as Signal<DemoRoleDefinition>,
    navigation: computed(() => DEMO_ROLES[roleState()].navigation),
    switchRole: jasmine.createSpy('switchRole').and.resolveTo(true),
    recordBlockedRoute: jasmine.createSpy('recordBlockedRoute'),
    consumeNotice: jasmine.createSpy('consumeNotice').and.returnValue(null),
  };

  beforeEach(async () => {
    roleState.set('manager');
    fakeRoleService.switchRole.calls.reset();
    fakeRoleService.recordBlockedRoute.calls.reset();
    fakeRoleService.consumeNotice.calls.reset();
    fakeRoleService.consumeNotice.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        { provide: DemoRoleService, useValue: fakeRoleService },
      ],
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    return fixture;
  }

  function destinations(fixture: ReturnType<typeof render>): string[] {
    const links = Array.from(fixture.nativeElement.querySelectorAll('.primary-nav a')) as HTMLAnchorElement[];
    return links.map(link => link.getAttribute('href')?.split('?')[0] ?? '');
  }

  it('renders the manager rail and persona by default', () => {
    const fixture = render();

    expect(destinations(fixture)).toEqual([
      '/app/dashboard',
      '/app/claims',
      '/app/analytics',
      '/app/intelligence',
      '/app/team-ops',
      '/app/reports',
    ]);
    expect(fixture.nativeElement.textContent).toContain('Alex Morgan');
    expect(fixture.nativeElement.textContent).toContain('Claims Manager');
    expect(fixture.nativeElement.textContent).toContain('Demo role');
    expect(fixture.nativeElement.querySelector('a.skip-link')?.getAttribute('href')).toBe('#main-content');
    expect(fixture.nativeElement.querySelector('#main-content')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('AI Copilot');
  });

  it('renders only adjuster destinations and Jordan Lee', () => {
    roleState.set('adjuster');
    const fixture = render();

    expect(destinations(fixture)).toEqual([
      '/app/my-work',
      '/app/claims',
      '/app/documents',
      '/app/reports',
    ]);
    expect(fixture.nativeElement.textContent).toContain('Jordan Lee');
    expect(fixture.nativeElement.textContent).toContain('Senior Adjuster');
    expect(fixture.nativeElement.textContent).not.toContain('Team Operations');
  });

  it('renders only administrator destinations and Priya Shah', () => {
    roleState.set('admin');
    const fixture = render();

    expect(destinations(fixture)).toEqual([
      '/app/workflows',
      '/app/reports',
      '/app/settings',
    ]);
    expect(fixture.nativeElement.textContent).toContain('Priya Shah');
    expect(fixture.nativeElement.textContent).toContain('Platform Administrator');
    expect(fixture.nativeElement.textContent).not.toContain('Claim Queue');
  });

  it('renders the universal search and accessible role switcher', () => {
    const fixture = render();
    const search = fixture.nativeElement.querySelector('.global-search input') as HTMLInputElement;
    const trigger = fixture.nativeElement.querySelector('app-role-switcher [aria-haspopup="menu"]');

    expect(fixture.nativeElement.querySelector('.app-topbar')).not.toBeNull();
    expect(search.placeholder).toBe('Search claims, policies, documents, people…');
    expect(trigger).not.toBeNull();
  });

  it('surfaces a role-ownership notice from the guard', () => {
    fakeRoleService.consumeNotice.and.returnValue('Claims Manager owns that destination in this demo.');
    const fixture = render();

    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain('Claims Manager');
  });
});
