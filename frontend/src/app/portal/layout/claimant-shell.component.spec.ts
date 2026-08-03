import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ClaimantShellComponent } from './claimant-shell.component';

@Component({ standalone: true, template: '' })
class EmptyPageComponent {}

describe('ClaimantShellComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ClaimantShellComponent],
      providers: [provideRouter([
        { path: 'portal', component: EmptyPageComponent },
        { path: '**', component: EmptyPageComponent },
      ])],
    }).compileComponents();
  });

  afterEach(() => sessionStorage.clear());

  it('shows exactly the claimant destinations and no employee role controls', async () => {
    await TestBed.inject(Router).navigateByUrl('/portal');
    const fixture = TestBed.createComponent(ClaimantShellComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const links = Array.from(fixture.nativeElement.querySelectorAll('.portal-nav a')) as HTMLAnchorElement[];
    expect(links.map(link => link.textContent?.trim())).toEqual([
      '◉My Claim', '▤Documents', '◇Messages', '?Help',
    ]);
    expect(fixture.nativeElement.querySelector('app-role-switcher')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Demo Role');
    expect(fixture.nativeElement.querySelector('a.skip-link')?.getAttribute('href')).toBe('#portal-main');
    expect(fixture.nativeElement.querySelector('#portal-main')).not.toBeNull();
    expect(links[0].getAttribute('aria-current')).toBe('page');
  });

  it('builds claim, documents, and message routes from session state', () => {
    sessionStorage.setItem('claimsflow.demoClaimId', 'claim-42');
    const fixture = TestBed.createComponent(ClaimantShellComponent);
    fixture.detectChanges();

    const links = Array.from(fixture.nativeElement.querySelectorAll('.portal-nav a')) as HTMLAnchorElement[];
    expect(links[0].getAttribute('href')).toBe('/portal/claims/claim-42');
    expect(links[1].getAttribute('href')).toBe('/portal/claims/claim-42/documents');
    expect(links[2].getAttribute('href')).toBe('/portal/claims/claim-42/messages');
  });
});
