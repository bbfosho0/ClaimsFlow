import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
  output,
  signal,
} from '@angular/core';
import { DEMO_ROLES, DemoRoleDefinition, DemoRoleId } from '../../demo-role/demo-role.model';
import { DemoRoleService } from '../../demo-role/demo-role.service';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-switcher.component.html',
  styleUrl: './role-switcher.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleSwitcherComponent {
  private readonly roleService = inject(DemoRoleService);

  readonly openClaimantPortal = output<void>();
  readonly resetDemoJourney = output<void>();
  readonly open = signal(false);
  readonly operator = this.roleService.definition;
  readonly roleDefinitions: readonly DemoRoleDefinition[] = Object.values(DEMO_ROLES);

  @ViewChild('trigger', { read: ElementRef })
  private trigger?: ElementRef<HTMLButtonElement>;

  @ViewChildren('menuItem', { read: ElementRef })
  private menuItems?: QueryList<ElementRef<HTMLButtonElement>>;

  toggleMenu(): void {
    this.open() ? this.closeMenu() : this.openMenu();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    this.openMenu();
  }

  onMenuKeydown(event: KeyboardEvent): void {
    const items = this.menuItems?.toArray() ?? [];
    if (items.length === 0) return;

    const current = items.findIndex(item => item.nativeElement === event.target);
    const index = current < 0 ? 0 : current;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMenu();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      (event.target as HTMLButtonElement).click();
      return;
    }

    let next: number | null = null;
    if (event.key === 'ArrowDown') next = (index + 1) % items.length;
    if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;

    if (next === null) return;
    event.preventDefault();
    items[next].nativeElement.focus();
  }

  async selectRole(role: DemoRoleId): Promise<void> {
    await this.roleService.switchRole(role);
    this.closeMenu();
  }

  openPortal(): void {
    this.openClaimantPortal.emit();
    this.closeMenu();
  }

  requestReset(): void {
    this.resetDemoJourney.emit();
    this.closeMenu();
  }

  private openMenu(): void {
    this.open.set(true);
    queueMicrotask(() => this.menuItems?.first?.nativeElement.focus());
  }

  private closeMenu(restoreFocus = true): void {
    this.open.set(false);
    if (restoreFocus) queueMicrotask(() => this.trigger?.nativeElement.focus());
  }
}
