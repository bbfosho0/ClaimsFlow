import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiError } from './api-error';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  it('maps Problem Details into ApiError', done => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()] });
    const controller = TestBed.inject(HttpTestingController);
    const http = TestBed.inject(HttpClient);
    http.get('/api/test').subscribe({
      error: (error: unknown) => {
        expect(error instanceof ApiError).toBeTrue();
        const apiError = error as ApiError;
        expect(apiError.code).toBe('CLAIM_NOT_FOUND');
        expect(apiError.requestId).toBe('request-1');
        done();
      },
    });
    controller.expectOne('/api/test').flush(
      { status: 404, detail: 'Missing', code: 'CLAIM_NOT_FOUND', requestId: 'request-1' },
      { status: 404, statusText: 'Not Found' },
    );
  });
});
