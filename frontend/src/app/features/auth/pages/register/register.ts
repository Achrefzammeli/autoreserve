import { Component, inject } from '@angular/core';
import { AuthService } from './../../../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit() {
    if (this.form.invalid) return;

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}