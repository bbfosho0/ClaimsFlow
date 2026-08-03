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
  private highlighted?: HTMLElement;
  private highlightTimer?: number;
  private highlightAttempt = 0;
  private readonly maxHighlightAttempts = 50;

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
      this.cancelHighlightSearch();
      this.clearHighlight();
      this.highlightAttempt = 0;
      this.scheduleHighlight(step);
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.cancelHighlightSearch();
    this.clearHighlight();
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

  private scheduleHighlight(step: TourStep | null): void {
    if (!step || step.route(this.claimId()) === '/tour') return;
    const delay = this.highlightAttempt === 0 ? 0 : 100;
    this.highlightTimer = globalThis.setTimeout(() => {
      this.highlightTimer = undefined;
      if (this.tryHighlight(step)) return;
      this.highlightAttempt += 1;
      if (this.highlightAttempt < this.maxHighlightAttempts) this.scheduleHighlight(step);
    }, delay);
  }

  private tryHighlight(step: TourStep): boolean {
    const target = document.querySelector<HTMLElement>(`[data-tour-target="${step.target}"]`);
    if (!target) return false;

    target.dataset['tourHighlighted'] = 'true';
    target.style.position = target.style.position || 'relative';
    target.style.zIndex = '30';
    target.style.outline = '2px solid var(--cf-color-intelligence-advisory)';
    target.style.outlineOffset = '5px';
    target.style.boxShadow = '0 0 0 8px rgb(154 124 255 / .07), 0 0 55px rgb(154 124 255 / .20)';
    this.highlighted = target;

    const reducedMotion = typeof globalThis.matchMedia === 'function'
      ? globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    return true;
  }

  private cancelHighlightSearch(): void {
    if (this.highlightTimer === undefined) return;
    clearTimeout(this.highlightTimer);
    this.highlightTimer = undefined;
  }

  private clearHighlight(): void {
    if (!this.highlighted) return;
    delete this.highlighted.dataset['tourHighlighted'];
    this.highlighted.style.removeProperty('z-index');
    this.highlighted.style.removeProperty('outline');
    this.highlighted.style.removeProperty('outline-offset');
    this.highlighted.style.removeProperty('box-shadow');
    this.highlighted = undefined;
  }
}
