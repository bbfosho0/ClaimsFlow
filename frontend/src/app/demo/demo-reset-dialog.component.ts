import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiError } from '../core/api/api-error';
import { DemoRoleService } from '../core/demo-role/demo-role.service';
import { DemoJourneySnapshot } from './demo-journey.models';
import { DemoJourneyService } from './demo-journey.service';

@Component({
  selector: 'app-demo-reset-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demo-reset-dialog.component.html',
  styleUrl: './demo-reset-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoResetDialogComponent {
  private readonly journey = inject(DemoJourneyService);
  private readonly roles = inject(DemoRoleService);
  private readonly router = inject(Router);

  readonly closed = output<void>();
  readonly completed = output<DemoJourneySnapshot>();
  readonly loading = signal(false);
  readonly error = signal('');

  cancel(): void {
    if (!this.loading()) this.closed.emit();
  }

  confirm(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.journey.reset().subscribe({
      next: snapshot => void this.finish(snapshot),
      error: (error: unknown) => {
        this.error.set(
          error instanceof ApiError && error.status === 404
            ? 'Demo reset is disabled. Start the backend with CLAIMSFLOW_DEMO_ENABLED=true.'
            : error instanceof ApiError
              ? error.message
              : 'The demo journey could not be reset. No success state was recorded.',
        );
        this.loading.set(false);
      },
    });
  }

  private async finish(snapshot: DemoJourneySnapshot): Promise<void> {
    await this.roles.switchRole('manager');
    this.completed.emit(snapshot);
    await this.router.navigate(['/tour']);
  }
}
