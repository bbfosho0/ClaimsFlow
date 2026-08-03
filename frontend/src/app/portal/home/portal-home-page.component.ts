import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portal-home-page.component.html',
  styleUrl: '../portal-pages.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalHomePageComponent {
  private readonly document = inject(DOCUMENT);
  readonly claimId = signal(this.readClaimId());

  private readClaimId(): string | null {
    try {
      return this.document.defaultView?.sessionStorage.getItem('claimsflow.demoClaimId') ?? null;
    } catch {
      return null;
    }
  }
}
