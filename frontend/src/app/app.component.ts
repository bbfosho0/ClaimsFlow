import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TourControllerComponent } from './tour/tour-controller.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TourControllerComponent],
  template: `<router-outlet /><app-tour-controller />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
