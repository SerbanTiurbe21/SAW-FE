import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { PrimeNG } from 'primeng/config';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import Aura from '@primeng/themes/aura';
import { InputTextModule } from 'primeng/inputtext';
import { AuthenticationRequest } from '../../interfaces/auth/authenticationrequest.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationResponse } from '../../interfaces/auth/authenticationresponse.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    CheckboxModule,
    ToastModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService],
})
export class LoginComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private fb: FormBuilder = inject(FormBuilder);

  constructor(
    private authService: AuthService,
    private router: Router,
    private msgService: MessageService,
    private primeng: PrimeNG
  ) {
    this.initializeForm();
    this.primeng.theme.set({
      preset: Aura,
      options: {
        cssLayer: {
          name: 'primeng',
          order: 'primeng',
        },
      },
    });
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  private initializeForm(): void {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get email() {
    return this.loginForm.controls['email'];
  }

  get password() {
    return this.loginForm.controls['password'];
  }

  loginUser(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const authRequest: AuthenticationRequest = {
        email: email!,
        password: password!,
      };
      this.authService
        .authenticate(authRequest)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (response: AuthenticationResponse) => {
            this.authService.setToken(response.access_token);
            this.msgService.add({
              severity: 'success',
              summary: 'Login successful',
              detail: 'You have successfully logged in',
            });
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 500);
          },
          error: (error) => {
            let detail: string = 'An error occurred. Please try again later.';
            if (error instanceof HttpErrorResponse) {
              switch (error.status) {
                case 400:
                  detail = 'Invalid email or password';
                  break;
                case 401:
                  detail = 'You are not authorized to access this resource';
                  break;
                case 500:
                  detail = 'An error occurred. Please try again later.';
                  break;
                default:
                  detail = 'An error occurred. Please try again later.';
                  break;
              }
            }
            this.msgService.add({
              severity: 'error',
              summary: 'Login failed',
              detail: detail,
            });
          },
        });
    }
  }
}
