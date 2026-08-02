import { TestBed } from '@angular/core/testing';
import { CommandFieldComponent } from './command-field.component';

describe('CommandFieldComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CommandFieldComponent] }).compileComponents();
  });

  it('renders seventeen operational signals and a textual summary', () => {
    const fixture = TestBed.createComponent(CommandFieldComponent);
    fixture.componentRef.setInput('activeCount', 17);
    fixture.componentRef.setInput('variant', 'showcase');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-signal]').length).toBe(17);
    expect(fixture.nativeElement.querySelector('figure')?.getAttribute('aria-label')).toContain('17 operational signals');
    expect(fixture.nativeElement.textContent).toContain('SLA pressure');
    expect(fixture.nativeElement.textContent).toContain('Missing evidence');
  });
});
