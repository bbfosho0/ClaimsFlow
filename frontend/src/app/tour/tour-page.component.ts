import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="tour-placeholder">
      <p class="eyebrow">ClaimsFlow / Guided tour</p>
      <h1>See the complete claim path in about 90 seconds.</h1>
      <p>The route-aware tour controller will guide the real application rather than replaying screenshots.</p>
      <a class="button primary" routerLink="/app/dashboard">Begin with portfolio pressure</a>
    </main>
  `,
  styles: [`
    .tour-placeholder { min-height: 100vh; display: grid; align-content: center; justify-items: start; gap: 18px; padding: clamp(28px, 8vw, 120px); background: radial-gradient(circle at 18% 0%, rgb(154 124 255 / .13), transparent 36%), var(--cf-color-canvas); }
    h1 { max-width: 900px; margin: 0; font-size: clamp(38px, 7vw, 78px); line-height: 1; letter-spacing: -.055em; }
    p:not(.eyebrow) { max-width: 680px; color: var(--cf-color-text-secondary); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourPageComponent {}
