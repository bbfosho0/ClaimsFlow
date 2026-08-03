import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PortalHomePageComponent } from './portal-home-page.component';

describe('PortalHomePageComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [PortalHomePageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => sessionStorage.clear());

  it('offers a new claim when no demo claim is stored', () => {
    const fixture = TestBed.createComponent(PortalHomePageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Start a claim');
    expect(fixture.nativeElement.textContent).not.toContain('Resume demo claim');
  });

  it('offers the exact stored demo claim when one exists', () => {
    sessionStorage.setItem('claimsflow.demoClaimId', 'claim-42');
    const fixture = TestBed.createComponent(PortalHomePageComponent);
    fixture.detectChanges();

    const resume = fixture.nativeElement.querySelector('a.portal-button') as HTMLAnchorElement;
    expect(resume.textContent).toContain('Resume demo claim');
    expect(resume.getAttribute('href')).toBe('/portal/claims/claim-42');
  });
});
