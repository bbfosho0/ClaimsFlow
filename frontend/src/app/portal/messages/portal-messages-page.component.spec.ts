import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '../../core/api/api-error';
import { PortalApiService } from '../data-access/portal-api.service';
import { PortalMessage } from '../models/portal.models';
import { PortalMessagesPageComponent } from './portal-messages-page.component';

describe('PortalMessagesPageComponent', () => {
  const api = jasmine.createSpyObj<PortalApiService>('PortalApiService', ['messages']);

  beforeEach(async () => {
    api.messages.calls.reset();
    await TestBed.configureTestingModule({
      imports: [PortalMessagesPageComponent],
      providers: [
        provideRouter([]),
        { provide: PortalApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'claim-1' }) } } },
      ],
    }).compileComponents();
  });

  it('shows a stable loading state', () => {
    api.messages.and.returnValue(new Subject<readonly PortalMessage[]>());
    const fixture = TestBed.createComponent(PortalMessagesPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading messages');
  });

  it('shows the exact empty-state copy', () => {
    api.messages.and.returnValue(of([]));
    const fixture = TestBed.createComponent(PortalMessagesPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No messages yet. Updates from your claims team will appear here.');
  });

  it('renders claimant-visible messages', () => {
    api.messages.and.returnValue(of([{
      id: 'message-1',
      author: 'Jordan Lee',
      body: 'Please upload photos of the damaged flooring.',
      createdAt: '2026-08-02T15:00:00Z',
    }]));
    const fixture = TestBed.createComponent(PortalMessagesPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Jordan Lee');
    expect(fixture.nativeElement.textContent).toContain('Please upload photos');
  });

  it('shows a retryable error state', () => {
    api.messages.and.returnValue(throwError(() => new ApiError(500, 'INTERNAL_ERROR', 'The message service is unavailable.')));
    const fixture = TestBed.createComponent(PortalMessagesPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Messages could not be loaded');
    expect(fixture.nativeElement.textContent).toContain('The message service is unavailable.');
  });
});
