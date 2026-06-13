import { Component, inject, signal } from '@angular/core';
import { AuthService } from './../../../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  loading      = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  form = this.fb.group({
    name:     ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    phone:    [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  togglePassword() { this.showPassword.update(v => !v); }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.detail ?? 'Registration failed. Please try again.'
        );
      },
    });
  }

  isInvalid(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c?.touched;
  }

  get passwordStrength(): number {
    const val = this.form.get('password')?.value ?? '';
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  get strengthLabel(): string {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[this.passwordStrength] ?? '';
  }

  get strengthClass(): string {
    const classes = ['', 'weak', 'fair', 'good', 'strong'];
    return classes[this.passwordStrength] ?? '';
  }
}