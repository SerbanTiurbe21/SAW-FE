import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private bypassUrls = [
    'http://localhost:8081/api/v1/auth/register',
    'http://localhost:8081/api/v1/auth/login',
  ];

  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.bypassUrls.some((url) => request.url === url)) {
      return next.handle(request);
    }

    const authToken = this.authService.getToken();

    const authReq = authToken
      ? request.clone({
          setHeaders: { Authorization: `Bearer ${authToken}` },
        })
      : request;

    return next.handle(authReq);
  }
}
