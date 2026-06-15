import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminBooking } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings implements OnInit {

  private adminService = inject(AdminService);

  bookings: AdminBooking[] = [];
  filtered: AdminBooking[] = [];

  customers: any[] = [];
  vehicles: any[] = [];

  loading = false;
  errorMessage = '';

  activeFilter = 'ALL';
  updatingId: number | null = null;

  showForm = false;

  bookingForm: any = {
    customer_id: null,
    vehicle_id: null,
    start_date: '',
    end_date: ''
  };

  readonly filters = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'];

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;

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

    this.adminService.getCustomers().subscribe({
      next: (c) => this.customers = c
    });

    this.adminService.getVehicles().subscribe({
      next: (v) => this.vehicles = v
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

  openCreateForm(): void {
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;

    this.bookingForm = {
      customer_id: null,
      vehicle_id: null,
      start_date: '',
      end_date: ''
    };
  }

  saveBooking(): void {

    if (!this.bookingForm.customer_id ||
        !this.bookingForm.vehicle_id ||
        !this.bookingForm.start_date ||
        !this.bookingForm.end_date) {
      this.errorMessage = 'Please fill all fields.';
      return;
    }

    this.adminService.createBooking(this.bookingForm).subscribe({
      next: () => {
        this.closeForm();
        this.loadAll();
      },
      error: () => {
        this.errorMessage = 'Failed to create booking.';
      }
    });
  }

  // ======================
  // AVAILABILITY LOGIC
  // ======================

  isVehicleUnavailable(vehicleId: number): boolean {

    if (!this.bookingForm.start_date || !this.bookingForm.end_date) {
      return false;
    }

    const selectedStart = new Date(this.bookingForm.start_date).getTime();
    const selectedEnd = new Date(this.bookingForm.end_date).getTime();

    return this.bookings.some(b => {

      if (b.vehicle_id !== vehicleId) return false;
      if (b.status === 'CANCELLED') return false;

      const start = new Date(b.start_date).getTime();
      const end = new Date(b.end_date).getTime();

      return start <= selectedEnd && end >= selectedStart;
    });
  }

  // ======================
  // PRICE CALC
  // ======================

  getSelectedVehiclePrice(): number {
    const v = this.vehicles.find(v => v.id == this.bookingForm.vehicle_id);
    return v ? v.price_per_day : 0;
  }

  getDays(): number {
    if (!this.bookingForm.start_date || !this.bookingForm.end_date) return 0;

    const start = new Date(this.bookingForm.start_date).getTime();
    const end = new Date(this.bookingForm.end_date).getTime();

    return Math.max(1, Math.ceil((end - start) / (1000 * 3600 * 24)));
  }

  getPreviewPrice(): number {
    return this.getDays() * this.getSelectedVehiclePrice();
  }

  statusClass(status: string): string {
    return {
      CONFIRMED: 'chip--success',
      PENDING: 'chip--pending',
      CANCELLED: 'chip--cancelled',
    }[status] ?? '';
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