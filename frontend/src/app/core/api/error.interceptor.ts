import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError, ProblemDetails } from './api-error';

export const errorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const problem = (error.error && typeof error.error === 'object' ? error.error : {}) as ProblemDetails;
        return throwError(() => new ApiError(
          error.status,
          problem.code ?? 'HTTP_ERROR',
          problem.detail ?? 'The request could not be completed.',
          problem.requestId,
          problem.fieldErrors ?? {},
        ));
      }
      return throwError(() => error);
    }),
  );
