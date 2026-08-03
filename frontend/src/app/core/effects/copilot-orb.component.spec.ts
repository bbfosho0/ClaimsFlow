import { TestBed } from '@angular/core/testing';
import { CopilotOrbComponent } from './copilot-orb.component';

describe('CopilotOrbComponent', () => {
  it('uses the static fallback when reduced motion is requested', async () => {
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => true,
    } as MediaQueryList);

    await TestBed.configureTestingModule({ imports: [CopilotOrbComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CopilotOrbComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.fallback()).toBeTrue();
    expect(fixture.nativeElement.querySelector('canvas')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.is-fallback')).not.toBeNull();
  });
});
