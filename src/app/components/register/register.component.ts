import { Component, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Subject, takeUntil } from 'rxjs';
import { PrimeNG } from 'primeng/config';
import { AuthService } from '../../services/auth/auth.service';
import { passwordMatchValidator } from '../../shared/password-match.directive';
import { RegisterRequest } from '../../interfaces/auth/registerrequest.model';
import { AuthenticationResponse } from '../../interfaces/auth/authenticationresponse.model';
import Aura from '@primeng/themes/aura';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    CheckboxModule,
    ToastModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [MessageService],
})
export class RegisterComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private fb: FormBuilder = inject(FormBuilder);

  constructor(
    private authService: AuthService,
    private router: Router,
    private primeng: PrimeNG,
    private msgService: MessageService
  ) {
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  registerForm = this.fb.group(
    {
      fullName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z]+ [a-zA-Z]+(-[a-zA-Z]+)?$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/
          ),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: passwordMatchValidator,
    }
  );

  get fullName() {
    return this.registerForm.controls['fullName'];
  }

  get email() {
    return this.registerForm.controls['email'];
  }

  get password() {
    return this.registerForm.controls['password'];
  }

  get confirmPassword() {
    return this.registerForm.controls['confirmPassword'];
  }

  submitDetails(): void {
    if (this.registerForm.valid) {
      const { fullName, email, password } = this.registerForm.value;
      const registerRequest: RegisterRequest = {
        name: fullName!,
        email: email!,
        password: password!,
      };

      this.authService
        .register(registerRequest)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (response: AuthenticationResponse) => {
            this.authService.setToken(response.access_token);
            this.msgService.add({
              severity: 'success',
              summary: 'Register successful',
              detail: 'You have successfully registered',
            });
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 500);
          },
          error: () => {},
        });
    }
  }
}
