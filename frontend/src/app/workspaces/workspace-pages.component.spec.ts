import { TestBed } from '@angular/core/testing';
import {
  AnalyticsPageComponent,
  DocumentsPageComponent,
  TeamOperationsPageComponent,
  WorkflowsPageComponent,
} from './workspace-pages.component';

describe('Midnight Command workspaces', () => {
  it('updates the analytics comparison window deterministically', async () => {
    await TestBed.configureTestingModule({ imports: [AnalyticsPageComponent] }).compileComponents();
    const fixture = TestBed.createComponent(AnalyticsPageComponent);
    fixture.detectChanges();

    fixture.componentInstance.setRange('Quarter to date');
    fixture.detectChanges();

    expect(fixture.componentInstance.range()).toBe('Quarter to date');
    expect(fixture.nativeElement.textContent).toContain('$12.86M');
  });

  it('selects a document and exposes the approved extraction workspace', async () => {
    await TestBed.configureTestingModule({ imports: [DocumentsPageComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DocumentsPageComponent);
    fixture.detectChanges();

    fixture.componentInstance.selectDocument('Police Report.pdf');
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedDocument().name).toBe('Police Report.pdf');
    expect(fixture.nativeElement.textContent).toContain('OCR & Extraction Tags');
    expect(fixture.nativeElement.textContent).toContain('Confidence Score');
  });

  it('filters team operations by squad', async () => {
    await TestBed.configureTestingModule({ imports: [TeamOperationsPageComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TeamOperationsPageComponent);
    fixture.detectChanges();

    fixture.componentInstance.setTeam('Property Response');
    fixture.detectChanges();

    expect(fixture.componentInstance.team()).toBe('Property Response');
    expect(fixture.nativeElement.textContent).toContain('Property Response');
  });

  it('runs a local workflow simulation without implying server persistence', async () => {
    await TestBed.configureTestingModule({ imports: [WorkflowsPageComponent] }).compileComponents();
    const fixture = TestBed.createComponent(WorkflowsPageComponent);
    fixture.detectChanges();

    fixture.componentInstance.runSimulation();
    fixture.detectChanges();

    expect(fixture.componentInstance.simulationState()).toBe('passed');
    expect(fixture.nativeElement.textContent).toContain('Local simulation passed');
  });
});
