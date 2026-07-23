import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<header class="brand"><strong>ClaimsFlow</strong></header><main><router-outlet /></main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
