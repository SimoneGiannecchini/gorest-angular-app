import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { GOREST_POSTS_API_BASE_URL, GOREST_USERS_API_BASE_URL } from '../constants/gorest-api';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const isGorestRequest =
    req.url.startsWith(GOREST_USERS_API_BASE_URL) || req.url.startsWith(GOREST_POSTS_API_BASE_URL);
  const requiresProtectedAction =
    isGorestRequest && !['GET', 'HEAD', 'OPTIONS'].includes(req.method);

  const apiReq =
    token && isGorestRequest
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      : req;

  return next(apiReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if ((err.status === 401 || err.status === 403) && requiresProtectedAction) {
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { error: 'invalid-token' }
        });
      }

      return throwError(() => err);
    })
  );
};
