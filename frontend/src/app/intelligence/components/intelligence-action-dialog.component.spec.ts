import { TestBed } from '@angular/core/testing';
import { PreparedAction } from '../intelligence.models';
import { ConfirmedIntelligenceAction, IntelligenceActionDialogComponent } from './intelligence-action-dialog.component';

const approvalAction: PreparedAction = {
  type: 'APPROVE_RECOMMENDATION',
  title: 'Approve recommendation',
  summary: 'Record the operator review without changing claim status.',
  effects: ['Recommendation state becomes approved.', 'Audit event is appended.'],
  requiresReason: true,
  destructive: false,
};

const draftAction: PreparedAction = {
  type: 'DRAFT_EVIDENCE_REQUEST',
  title: 'Draft evidence request',
  summary: 'Prepare a local draft only.',
  effects: ['No communication is sent.', 'Claim state is unchanged.'],
  requiresReason: false,
  destructive: false,
};

describe('IntelligenceActionDialogComponent', () => {
  it('blocks consequential confirmation until a valid reason is entered', () => {
    const fixture = TestBed.createComponent(IntelligenceActionDialogComponent);
    fixture.componentRef.setInput('action', approvalAction);
    let confirmed: ConfirmedIntelligenceAction | null = null;
    fixture.componentInstance.confirmed.subscribe(value => confirmed = value);
    fixture.detectChanges();

    const confirm = fixture.nativeElement.querySelector('.dialog-actions .button.primary') as HTMLButtonElement;
    confirm.click();
    fixture.detectChanges();

    expect(confirmed).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Enter a reason of at least 8 characters.');
  });

  it('emits a normalized reason', () => {
    const fixture = TestBed.createComponent(IntelligenceActionDialogComponent);
    fixture.componentRef.setInput('action', approvalAction);
    let confirmed: ConfirmedIntelligenceAction | null = null;
    fixture.componentInstance.confirmed.subscribe(value => confirmed = value);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = '  Evidence reviewed by operator.  ';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const confirm = fixture.nativeElement.querySelector('.dialog-actions .button.primary') as HTMLButtonElement;
    confirm.click();

    expect(confirmed?.reason).toBe('Evidence reviewed by operator.');
  });

  it('confirms a draft action without requiring a reason', () => {
    const fixture = TestBed.createComponent(IntelligenceActionDialogComponent);
    fixture.componentRef.setInput('action', draftAction);
    let confirmed: ConfirmedIntelligenceAction | null = null;
    fixture.componentInstance.confirmed.subscribe(value => confirmed = value);
    fixture.detectChanges();

    const confirm = fixture.nativeElement.querySelector('.dialog-actions .button.primary') as HTMLButtonElement;
    confirm.click();

    expect(confirmed?.action).toBe(draftAction);
    expect(confirmed?.reason).toBe('');
  });
});
