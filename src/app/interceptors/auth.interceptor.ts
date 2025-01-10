import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { AuthService } from '../services/auth/auth.service';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  const authService = inject(AuthService);

  const bypassUrls = [
    'http://localhost:8081/api/v1/auth/register',
    'http://localhost:8081/api/v1/auth/login',
  ];

  if (bypassUrls.some((url) => req.url === url)) {
    return next(req);
  }

  const authToken = authService.getToken();

  const authReq = authToken
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${authToken}` },
      })
    : req;

  return next(authReq);
}
