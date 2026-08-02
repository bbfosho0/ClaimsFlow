import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IntelligenceQueueItem } from '../intelligence.models';
import { IntelligenceReviewQueueComponent } from './intelligence-review-queue.component';

const firstItem: IntelligenceQueueItem = {
  claim: {
    id: 'claim-1',
    claimNumber: 'CF-2026-1001',
    claimantName: 'Taylor Morgan',
    claimType: 'AUTO',
    priority: 'CRITICAL',
    status: 'UNDER_REVIEW',
    slaDeadline: '2026-08-03T12:00:00Z',
    completenessPercentage: 50,
  },
  attentionScore: 94,
  reason: 'Critical claim with missing evidence.',
  tone: 'critical',
};

const secondItem: IntelligenceQueueItem = {
  claim: {
    id: 'claim-2',
    claimNumber: 'CF-2026-1002',
    claimantName: 'Jordan Lee',
    claimType: 'PROPERTY',
    priority: 'HIGH',
    status: 'WAITING_FOR_INFORMATION',
    slaDeadline: '2026-08-04T12:00:00Z',
    completenessPercentage: 75,
  },
  attentionScore: 76,
  reason: 'Evidence request needs review.',
  tone: 'warning',
};

@Component({
  standalone: true,
  imports: [IntelligenceReviewQueueComponent],
  template: `
    <app-intelligence-review-queue
      [items]="items"
      selectedId="claim-2"
      [loading]="loading"
      (selected)="selection = $event"
    />
  `,
})
class HostComponent {
  items: IntelligenceQueueItem[] = [firstItem, secondItem];
  loading = false;
  selection: IntelligenceQueueItem | null = null;
}

describe('IntelligenceReviewQueueComponent', () => {
  it('renders queue items and emits the selected item', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('button.intelligence-row') as NodeListOf<HTMLButtonElement>;
    expect(rows.length).toBe(2);
    expect(rows[1].classList).toContain('selected');

    rows[0].click();
    expect(fixture.componentInstance.selection).toBe(firstItem);
  });

  it('renders loading and empty states', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.loading = true;
    fixture.componentInstance.items = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();

    fixture.componentInstance.loading = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No claims are available for intelligence review.');
  });
});
