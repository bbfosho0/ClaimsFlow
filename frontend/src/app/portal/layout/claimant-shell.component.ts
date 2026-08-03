import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-claimant-shell',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './claimant-shell.component.html',
  styleUrl: './claimant-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimantShellComponent {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly claimId = signal<string | null>(null);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.refreshClaimId());
  }

  claimRoute(): readonly string[] {
    return this.claimId() ? ['/portal/claims', this.claimId()!] : ['/portal'];
  }

  documentsRoute(): readonly string[] {
    return this.claimId() ? ['/portal/claims', this.claimId()!, 'documents'] : ['/portal'];
  }

  messagesRoute(): readonly string[] {
    return this.claimId() ? ['/portal/claims', this.claimId()!, 'messages'] : ['/portal'];
  }

  private refreshClaimId(): void {
    try {
      this.claimId.set(this.document.defaultView?.sessionStorage.getItem('claimsflow.demoClaimId') ?? null);
    } catch {
      this.claimId.set(null);
    }
  }
}
