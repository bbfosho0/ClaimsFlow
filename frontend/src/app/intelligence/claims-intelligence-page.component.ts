import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <section class="cf-page page-enter intelligence-placeholder">
      <header class="cf-page-header">
        <div><p class="eyebrow">Claims intelligence</p><h1>Review center</h1><p>Evidence-grounded recommendations with explicit human authority.</p></div>
      </header>
      <div class="panel placeholder-panel"><span class="cf-chip" data-tone="advisory">Advisory only</span><h2>Claims Intelligence is being connected to the live claims workflow.</h2></div>
    </section>
  `,
  styles: [`
    .placeholder-panel { min-height: 420px; display: grid; align-content: center; justify-items: start; gap: 18px; padding: 32px; background: radial-gradient(circle at 82% 16%, rgb(154 124 255 / .16), transparent 34%), var(--cf-color-surface-default); }
    h2 { max-width: 680px; margin: 0; font-size: clamp(28px, 5vw, 54px); line-height: 1; letter-spacing: -.045em; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimsIntelligencePageComponent {}
