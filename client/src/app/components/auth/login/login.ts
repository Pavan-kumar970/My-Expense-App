import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  form: FormGroup;
  showPassword = false;
  loading = false;
  error = '';
  capsLockOn = false;

  constructor(private auth: Auth, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [true]
    });

    // Prefill remembered email
    const savedEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('remember_email') : null;
    if (savedEmail) {
      this.form.patchValue({ email: savedEmail, remember: true });
    }
  }

  doLogin(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error = '';
    this.loading = true;

    // Persist remember-me
    if (this.form.value.remember) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('remember_email', this.form.value.email);
      }
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('remember_email');
    }

    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || 'Login failed. Please try again.';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onPasswordKeyup(event: KeyboardEvent): void {
    // Detect CapsLock state if available
    // Some browsers support getModifierState
    // Default to false if not available
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.capsLockOn = typeof event.getModifierState === 'function' ? event.getModifierState('CapsLock') : false;
  }
}

