import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the universal eleven-destination rail without feature-data dependencies', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const links = Array.from(fixture.nativeElement.querySelectorAll('.primary-nav a')) as HTMLAnchorElement[];
    const destinations = links.map(link => link.getAttribute('href'));

    expect(destinations).toEqual([
      '/app/dashboard',
      '/app/claims',
      '/app/claims/new',
      '/app/my-work',
      '/app/analytics',
      '/app/intelligence',
      '/app/documents',
      '/app/team-ops',
      '/app/workflows',
      '/app/reports',
      '/app/settings',
    ]);
    expect(fixture.nativeElement.querySelector('a.skip-link')?.getAttribute('href')).toBe('#main-content');
    expect(fixture.nativeElement.querySelector('#main-content')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('AI Copilot');
    expect(fixture.nativeElement.textContent).toContain('Alex Morgan');
    expect(fixture.nativeElement.textContent).toContain('Claims Manager');
  });

  it('renders the universal top bar', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.app-topbar')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.global-search')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Search claims, policies, documents, people');
  });
});
