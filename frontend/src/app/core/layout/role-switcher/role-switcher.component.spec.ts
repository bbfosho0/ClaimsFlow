import { Signal, computed, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { DEMO_ROLES, DemoRoleDefinition, DemoRoleId } from '../../demo-role/demo-role.model';
import { DemoRoleService } from '../../demo-role/demo-role.service';
import { RoleSwitcherComponent } from './role-switcher.component';

describe('RoleSwitcherComponent', () => {
  const roleState = signal<DemoRoleId>('manager');
  const switchRole = jasmine.createSpy('switchRole').and.callFake(async (role: DemoRoleId) => {
    roleState.set(role);
    return true;
  });
  const fakeService = {
    role: roleState.asReadonly(),
    definition: computed(() => DEMO_ROLES[roleState()]) as Signal<DemoRoleDefinition>,
    navigation: computed(() => DEMO_ROLES[roleState()].navigation),
    switchRole,
  };
  let fixture: ComponentFixture<RoleSwitcherComponent>;

  beforeEach(async () => {
    roleState.set('manager');
    switchRole.calls.reset();
    await TestBed.configureTestingModule({
      imports: [RoleSwitcherComponent],
      providers: [{ provide: DemoRoleService, useValue: fakeService }],
    }).compileComponents();
    fixture = TestBed.createComponent(RoleSwitcherComponent);
    fixture.detectChanges();
  });

  it('shows the current persona and all approved journey actions', () => {
    (fixture.nativeElement.querySelector('.profile-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('DEMO ROLE');
    expect(fixture.nativeElement.textContent).toContain('Claims Manager');
    expect(fixture.nativeElement.textContent).toContain('Adjuster');
    expect(fixture.nativeElement.textContent).toContain('Administrator');
    expect(fixture.nativeElement.textContent).toContain('Open Claimant Portal');
    expect(fixture.nativeElement.textContent).toContain('Reset Demo Journey');
  });

  it('emits claimant portal and reset actions', () => {
    const portal = jasmine.createSpy('portal');
    const reset = jasmine.createSpy('reset');
    fixture.componentInstance.openClaimantPortal.subscribe(portal);
    fixture.componentInstance.resetDemoJourney.subscribe(reset);

    fixture.componentInstance.toggleMenu();
    fixture.detectChanges();
    const actions = fixture.nativeElement.querySelectorAll('.menu-action') as NodeListOf<HTMLButtonElement>;
    actions[0].click();
    fixture.detectChanges();

    fixture.componentInstance.toggleMenu();
    fixture.detectChanges();
    (fixture.nativeElement.querySelectorAll('.menu-action')[1] as HTMLButtonElement).click();

    expect(portal).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('supports Enter, ArrowDown, Enter selection, and Escape focus restoration', fakeAsync(() => {
    const trigger = fixture.nativeElement.querySelector('.profile-trigger') as HTMLButtonElement;
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    flushMicrotasks();

    const roleItems = fixture.nativeElement.querySelectorAll('[role="menuitemradio"]') as NodeListOf<HTMLButtonElement>;
    expect(document.activeElement).toBe(roleItems[0]);

    roleItems[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(roleItems[1]);

    roleItems[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    flushMicrotasks();
    fixture.detectChanges();

    expect(switchRole).toHaveBeenCalledOnceWith('adjuster');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    flushMicrotasks();
    const reopened = fixture.nativeElement.querySelector('[role="menuitemradio"]') as HTMLButtonElement;
    reopened.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    flushMicrotasks();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  }));
});
