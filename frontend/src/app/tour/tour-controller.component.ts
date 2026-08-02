import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TourOrchestratorService } from './tour-orchestrator.service';
import { TourStep } from './tour.models';

@Component({
  selector: 'app-tour-controller',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-controller.component.html',
  styleUrl: './tour-controller.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourControllerComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  readonly orchestrator = inject(TourOrchestratorService);
  private readonly subscription = new Subscription();
  private highlighted?: Element;

  readonly current = signal<TourStep | null>(null);
  readonly claimId = signal('');
  readonly expanded = signal(false);
  readonly collapsed = signal(false);

  ngOnInit(): void {
    this.subscription.add(this.route.queryParamMap.subscribe(params => {
      const step = this.orchestrator.step(params.get('tour'));
      this.current.set(step);
      this.claimId.set(params.get('claimId') ?? this.orchestrator.restore()?.claimId ?? '');
      this.expanded.set(false);
      this.collapsed.set(false);
      setTimeout(() => this.highlight(step));
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.highlighted?.classList.remove('tour-highlight');
  }

  previous(): void {
    const step = this.current();
    if (step && step.index > 0) void this.orchestrator.navigateTo(step.index - 1, this.claimId());
  }

  next(): void {
    const step = this.current();
    if (!step) return;
    if (step.index >= this.orchestrator.steps.length - 1) {
      void this.orchestrator.exit();
      return;
    }
    void this.orchestrator.navigateTo(step.index + 1, this.claimId());
  }

  exit(): void {
    void this.orchestrator.exit();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (!this.current()) return;
    if (event.key === 'Escape') this.exit();
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.previous();
  }

  private highlight(step: TourStep | null): void {
    this.highlighted?.classList.remove('tour-highlight');
    this.highlighted = undefined;
    if (!step || step.route(this.claimId()) === '/tour') return;
    const target = document.querySelector(`[data-tour-target="${step.target}"]`);
    target?.classList.add('tour-highlight');
    this.highlighted = target ?? undefined;
    target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }
}
