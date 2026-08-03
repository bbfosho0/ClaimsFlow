import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiError } from '../../core/api/api-error';
import { PortalApiService } from '../data-access/portal-api.service';
import { PortalMessage } from '../models/portal.models';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portal-messages-page.component.html',
  styleUrl: '../portal-pages.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalMessagesPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PortalApiService);

  readonly claimId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly loading = signal(true);
  readonly error = signal('');
  readonly messages = signal<readonly PortalMessage[]>([]);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.messages(this.claimId).subscribe({
      next: messages => {
        this.messages.set(messages);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(error instanceof ApiError ? error.message : 'Messages could not be loaded.');
        this.loading.set(false);
      },
    });
  }
}
