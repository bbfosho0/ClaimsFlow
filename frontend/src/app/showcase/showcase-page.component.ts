import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="showcase-placeholder">
      <p class="eyebrow">ClaimsFlow / Operational signal intelligence</p>
      <h1>Claims operations with evidence, authority, and audit built in.</h1>
      <p>The complete cinematic showcase is loading into this route.</p>
      <div><a class="button primary" routerLink="/tour">Take guided tour</a><a class="button secondary" routerLink="/app/dashboard">Open live system</a></div>
    </main>
  `,
  styles: [`
    .showcase-placeholder { min-height: 100vh; display: grid; align-content: center; gap: 18px; padding: clamp(28px, 8vw, 120px); background: radial-gradient(circle at 75% 20%, rgb(66 205 236 / .1), transparent 32%), var(--cf-color-canvas); }
    h1 { max-width: 1000px; margin: 0; font-size: clamp(42px, 8vw, 96px); line-height: .95; letter-spacing: -.065em; }
    p:not(.eyebrow) { max-width: 700px; color: var(--cf-color-text-secondary); }
    div { display: flex; flex-wrap: wrap; gap: 10px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePageComponent {}
