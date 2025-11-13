import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';
  showPassword = false;
  capsLockOn = false;

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';
    const { name, email, password } = this.form.value;
    this.auth.register(email, password, name).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Account created. You can sign in now.';
        setTimeout(() => this.router.navigate(['/login']), 800);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || 'Registration failed.';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onPasswordKeyup(event: KeyboardEvent): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.capsLockOn = typeof event.getModifierState === 'function' ? event.getModifierState('CapsLock') : false;
  }
}
