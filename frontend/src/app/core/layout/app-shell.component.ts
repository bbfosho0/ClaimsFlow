import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="shell">
      <aside class="sidebar" aria-label="Primary navigation">
        <div class="brand-block">
          <span class="brand-mark">CF</span>
          <div><strong>ClaimsFlow</strong><small>Operations</small></div>
        </div>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/claims" routerLinkActive="active">Claims queue</a>
          <a routerLink="/claims/new" routerLinkActive="active">New claim</a>
        </nav>
      </aside>
      <main id="main-content" tabindex="-1"><router-outlet /></main>
    </div>
  `,
  styles: [`
    .shell{min-height:100vh;display:grid;grid-template-columns:240px 1fr}.sidebar{background:#10233f;color:#fff;padding:1.5rem;position:sticky;top:0;height:100vh}.brand-block{display:flex;gap:.75rem;align-items:center;margin-bottom:2rem}.brand-mark{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#57d3c1;color:#10233f;font-weight:800}.brand-block small{display:block;color:#adc0db;margin-top:.15rem}nav{display:grid;gap:.45rem}nav a{color:#dce7f5;text-decoration:none;padding:.75rem;border-radius:8px}nav a:hover,nav a.active{background:#1d3a61;color:#fff}main{padding:2rem;min-width:0}.skip-link{position:fixed;left:1rem;top:-4rem;background:#fff;color:#10233f;padding:.75rem;z-index:10}.skip-link:focus{top:1rem}@media(max-width:760px){.shell{grid-template-columns:1fr}.sidebar{height:auto;position:static;padding:1rem}.brand-block{margin-bottom:1rem}nav{grid-template-columns:repeat(3,1fr)}nav a{text-align:center;font-size:.9rem}main{padding:1rem}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {}
