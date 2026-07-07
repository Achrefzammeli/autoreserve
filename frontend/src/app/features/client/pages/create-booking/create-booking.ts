import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './create-booking.html',
  styleUrl: './create-booking.css',
})
export class CreateBooking {

  private fb = inject(FormBuilder);
  private router = inject(Router);

  submitted = false;

  form = this.fb.group({
    start_date: [''],
    end_date: [''],
  });

  search(): void {
    this.submitted = true;
    const { start_date, end_date } = this.form.value;
    if (!start_date || !end_date) return;

    this.router.navigate(['/fleet'], {
      queryParams: { start_date, end_date }
    });
  }
}
