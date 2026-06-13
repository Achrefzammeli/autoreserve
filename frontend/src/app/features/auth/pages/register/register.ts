import { Component, inject, signal } from '@angular/core';
import { AuthService } from './../../../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

type RegisterStep = 'form' | 'totp';

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

  step         = signal<RegisterStep>('form');
  loading      = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  qrCode       = signal('');
  secret       = signal('');
  emailForTotp = signal('');

  form = this.fb.group({
    name:     ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    phone:    [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  togglePassword() { this.showPassword.update(v => !v); }

  // ── Step 1 : register ─────────────────────────────────────────────
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.register(this.form.getRawValue()).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.qrCode.set(res.qr_code);
        this.secret.set(res.secret);
        this.emailForTotp.set(this.form.value.email!);
        this.step.set('totp');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.detail ?? 'Registration failed. Please try again.'
        );
      },
    });
  }
      skipTotp() {
        this.router.navigate(['/auth/login']);
      }
  // ── Step 2 : confirm TOTP ─────────────────────────────────────────
  confirmTotp() {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.confirmTotp(this.emailForTotp(), this.codeForm.value.code!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.detail ?? 'Invalid code. Try again.'
        );
      },
    });
  }

  isInvalid(form: any, field: string) {
    const c = form.get(field);
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
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.passwordStrength] ?? '';
  }

  get strengthClass(): string {
    return ['', 'weak', 'fair', 'good', 'strong'][this.passwordStrength] ?? '';
  }
}