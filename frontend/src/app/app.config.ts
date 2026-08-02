import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { errorInterceptor } from './core/api/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideHttpClient(withInterceptors([errorInterceptor])),
  ],
};
