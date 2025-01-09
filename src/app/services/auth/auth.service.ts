import { Injectable, OnDestroy, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest } from '../../interfaces/auth/registerrequest.model';
import { AuthenticationResponse } from '../../interfaces/auth/authenticationresponse.model';
import { AuthenticationRequest } from '../../interfaces/auth/authenticationrequest.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private url = 'http://localhost:8081/api/v1/auth';
  private http: HttpClient = inject(HttpClient);

  constructor() {}

  ngOnDestroy(): void {}

  register(
    registerRequest: RegisterRequest
  ): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      `${this.url}/register`,
      registerRequest
    );
  }

  authenticate(
    authRequest: AuthenticationRequest
  ): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      `${this.url}/authenticate`,
      authRequest
    );
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
