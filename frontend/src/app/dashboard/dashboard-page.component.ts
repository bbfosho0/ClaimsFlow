import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiError } from '../core/api/api-error';
import { DashboardSnapshot } from '../shared/models/dashboard.models';
import { MetricCardComponent } from '../shared/ui/metric-card/metric-card.component';
import { DashboardService } from './dashboard.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, MetricCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly service = inject(DashboardService);
  readonly data = signal<DashboardSnapshot | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  ngOnInit(): void {
    this.service.load().subscribe({
      next: value => {
        this.data.set(value);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(error instanceof ApiError ? error.message : 'Dashboard data is unavailable.');
        this.loading.set(false);
      },
    });
  }
}
