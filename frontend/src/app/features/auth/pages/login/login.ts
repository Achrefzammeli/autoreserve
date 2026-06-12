import { Component, inject } from '@angular/core';
import { AuthService } from './../../../../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private fb = inject(FormBuilder);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  submit() {
    if (this.form.invalid) return;

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res: any) => {
        this.auth.saveToken(res.access_token);

        const role = this.getRoleFromToken(res.access_token);

        if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
          return;
        }

        this.router.navigate(['/client/dashboard']);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  private getRoleFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(normalized));

      return decoded.role ?? null;
    } catch {
      return null;
    }
  }
}