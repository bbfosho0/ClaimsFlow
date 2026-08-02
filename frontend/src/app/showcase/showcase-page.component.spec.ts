import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShowcasePageComponent } from './showcase-page.component';

describe('ShowcasePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowcasePageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('progresses through the staged opening and resolves to meaningful content', fakeAsync(() => {
    const fixture = TestBed.createComponent(ShowcasePageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-showcase-state]')?.getAttribute('data-showcase-state')).toBe('initial');

    tick(650);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-showcase-state]')?.getAttribute('data-showcase-state')).toBe('signalLock');

    tick(730);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-showcase-state]')?.getAttribute('data-showcase-state')).toBe('ready');
    expect(fixture.nativeElement.textContent).toContain('Human authority remains explicit');
  }));

  it('lets the user skip the opening immediately', () => {
    const fixture = TestBed.createComponent(ShowcasePageComponent);
    fixture.detectChanges();

    const skip = fixture.nativeElement.querySelector('[data-skip-intro]') as HTMLButtonElement;
    skip.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-showcase-state]')?.getAttribute('data-showcase-state')).toBe('ready');
    expect(fixture.nativeElement.querySelector('a[href="/tour"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="/app/dashboard"]')).not.toBeNull();
  });
});
