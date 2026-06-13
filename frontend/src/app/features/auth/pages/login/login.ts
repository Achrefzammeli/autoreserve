import { Component, inject, signal } from '@angular/core';
import { AuthService } from './../../../../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  loading      = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res: any) => {
        this.auth.saveToken(res.access_token);
        const role = this.auth.getRole();
        this.loading.set(false);
        this.router.navigate(role === 'ADMIN' ? ['/admin/dashboard'] : ['/client/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Invalid email or password. Please try again.');
      },
    });
  }

  isInvalid(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c?.touched;
  }
}