import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TotpService } from '../../../../core/services/totp.service';

type Step = 'email' | 'qr' | 'code' | 'password' | 'success';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private fb      = inject(FormBuilder);
  private totp    = inject(TotpService);
  private router  = inject(Router);

  step         = signal<Step>('email');
  loading      = signal(false);
  error        = signal('');
  qrCode       = signal('');
  secret       = signal('');
  email        = signal('');

  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  passwordForm = this.fb.group({
    new_password:     ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', Validators.required],
  });

  // ── Step 1 : submit email ─────────────────────────────────────────
  submitEmail() {
    if (this.emailForm.invalid) { this.emailForm.markAllAsTouched(); return; }

    this.loading.set(true);
    this.error.set('');
    const em = this.emailForm.value.email!;

    this.totp.setup(em).subscribe({
      next: (res) => {
        this.email.set(em);
        this.loading.set(false);

        if (res.status === 'setup_required') {
          this.qrCode.set(res.qr_code!);
          this.secret.set(res.secret!);
          this.step.set('qr');
        } else {
          this.step.set('code');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.detail ?? 'No account found with this email.');
      }
    });
  }

  // ── Step 2 : QR seen, go to code ─────────────────────────────────
  qrConfirmed() {
    this.step.set('code');
  }

  // ── Step 3 : verify TOTP code ─────────────────────────────────────
  submitCode() {
    if (this.codeForm.invalid) { this.codeForm.markAllAsTouched(); return; }

    this.loading.set(true);
    this.error.set('');

    this.totp.verify(this.email(), this.codeForm.value.code!).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('password');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.detail ?? 'Invalid code. Try again.');
      }
    });
  }

  // ── Step 4 : reset password ───────────────────────────────────────
  submitPassword() {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }

    const { new_password, confirm_password } = this.passwordForm.value;
    if (new_password !== confirm_password) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.totp.resetPassword(this.email(), this.codeForm.value.code!, new_password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('success');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.detail ?? 'Failed to reset password.');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  isInvalid(form: any, field: string) {
    const c = form.get(field);
    return c?.invalid && c?.touched;
  }

  get passwordStrength(): number {
    const val = this.passwordForm.get('new_password')?.value ?? '';
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  get strengthClass(): string {
    return ['', 'weak', 'fair', 'good', 'strong'][this.passwordStrength] ?? '';
  }

  get strengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.passwordStrength] ?? '';
  }
}