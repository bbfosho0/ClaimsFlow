import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TourControllerComponent } from './tour-controller.component';
import { TourOrchestratorService } from './tour-orchestrator.service';
import { TourStep } from './tour.models';

const step: TourStep = {
  id: 'claimant-portal',
  index: 0,
  title: 'Claimant portal',
  notice: 'Notice',
  technicalProof: 'Proof',
  target: 'claimant-portal',
  route: claimId => `/portal/claims/${claimId}`,
};

describe('TourControllerComponent', () => {
  const queryParams = new BehaviorSubject(convertToParamMap({
    tour: 'claimant-portal',
    claimId: 'claim-1',
  }));
  const orchestrator = {
    steps: [step],
    step: jasmine.createSpy('step').and.returnValue(step),
    restore: jasmine.createSpy('restore').and.returnValue(null),
    navigateTo: jasmine.createSpy('navigateTo').and.resolveTo(true),
    exit: jasmine.createSpy('exit').and.resolveTo(true),
  };

  beforeEach(async () => {
    orchestrator.step.calls.reset();
    orchestrator.step.and.returnValue(step);
    await TestBed.configureTestingModule({
      imports: [TourControllerComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams.asObservable() } },
        { provide: TourOrchestratorService, useValue: orchestrator },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    document.querySelectorAll('[data-tour-test-target]').forEach(element => element.remove());
  });

  it('retries until an asynchronously rendered route target exists and cleans it on destroy', fakeAsync(() => {
    const fixture = TestBed.createComponent(TourControllerComponent);
    fixture.detectChanges();
    tick(50);

    const target = document.createElement('section');
    target.dataset['tourTarget'] = 'claimant-portal';
    target.dataset['tourTestTarget'] = 'true';
    target.scrollIntoView = jasmine.createSpy('scrollIntoView');
    document.body.appendChild(target);

    tick(150);
    expect(target.dataset['tourHighlighted']).toBe('true');
    expect(target.style.outline).toContain('2px solid');
    expect(target.scrollIntoView).toHaveBeenCalled();

    fixture.destroy();
    expect(target.dataset['tourHighlighted']).toBeUndefined();
    expect(target.style.outline).toBe('');
  }));
});
