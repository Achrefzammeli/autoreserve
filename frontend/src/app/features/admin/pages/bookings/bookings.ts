import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminBooking } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings implements OnInit {

  private adminService = inject(AdminService);

  bookings: AdminBooking[] = [];
  filtered: AdminBooking[] = [];
  loading = false;
  errorMessage = '';
  activeFilter = 'ALL';
  updatingId: number | null = null;

  readonly filters = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'];

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminService.getBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.applyFilter(this.activeFilter);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load bookings.';
        this.loading = false;
      }
    });
  }

  applyFilter(filter: string): void {
    this.activeFilter = filter;
    this.filtered = filter === 'ALL'
      ? this.bookings
      : this.bookings.filter(b => b.status === filter);
  }

  updateStatus(booking: AdminBooking, status: string): void {
    if (booking.status === status) return;
    this.updatingId = booking.id;

    this.adminService.updateBookingStatus(booking.id, status).subscribe({
      next: () => {
        booking.status = status;
        this.applyFilter(this.activeFilter);
        this.updatingId = null;
      },
      error: () => {
        this.errorMessage = 'Failed to update booking status.';
        this.updatingId = null;
      }
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED: 'chip--success',
      PENDING: 'chip--pending',
      CANCELLED: 'chip--cancelled',
    };
    return map[status] ?? '';
  }

  get totalRevenue(): number {
    return this.bookings
      .filter(b => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + b.total_price, 0);
  }

  get pendingCount(): number {
    return this.bookings.filter(b => b.status === 'PENDING').length;
  }

  get confirmedCount(): number {
    return this.bookings.filter(b => b.status === 'CONFIRMED').length;
  }
}