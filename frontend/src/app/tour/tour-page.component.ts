import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TourOrchestratorService } from './tour-orchestrator.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tour-page.component.html',
  styleUrl: './tour-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourPageComponent {
  readonly orchestrator = inject(TourOrchestratorService);
  readonly starting = signal(false);
  readonly error = signal('');
  readonly activeTour = this.orchestrator.restore();

  start(): void {
    this.starting.set(true);
    this.error.set('');
    this.orchestrator.start().subscribe({
      next: () => this.starting.set(false),
      error: () => {
        this.error.set('The tour could not resolve a seeded claim. You can still open the application directly.');
        this.starting.set(false);
      },
    });
  }

  resume(): void {
    const progress = this.orchestrator.restore();
    const step = progress ? this.orchestrator.step(progress.step) : null;
    if (step) void this.orchestrator.navigateTo(step.index, progress?.claimId);
    else this.start();
  }
}
