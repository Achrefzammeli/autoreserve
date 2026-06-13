import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser, AdminBooking } from '../../../../core/services/admin.service';
import { map } from 'rxjs';

interface CustomerRow extends AdminUser {
  bookings_count: number;
  total_spent: number;
  last_booking: string | null;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {

  private adminService = inject(AdminService);

  customers: CustomerRow[] = [];
  filtered: CustomerRow[] = [];
  loading = false;
  errorMessage = '';
  searchQuery = '';

  // drawer
  selectedCustomer: CustomerRow | null = null;
  customerBookings: AdminBooking[] = [];
  drawerOpen = false;
  drawerLoading = false;

  private allBookings: AdminBooking[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    // load users and all bookings in parallel
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.adminService.getBookings().subscribe({
          next: (bookings) => {
            this.allBookings = bookings;
            this.customers = users.map(u => this.buildRow(u, bookings));
            this.filtered = [...this.customers];
            this.loading = false;
          },
          error: () => {
            // users loaded, bookings failed — still show users
            this.customers = users.map(u => this.buildRow(u, []));
            this.filtered = [...this.customers];
            this.loading = false;
          }
        });
      },
      error: () => {
        this.errorMessage = 'Failed to load customers.';
        this.loading = false;
      }
    });
  }

  private buildRow(user: AdminUser, bookings: AdminBooking[]): CustomerRow {
    const userBookings = bookings.filter(b => b.user_id === user.id);
    const spent = userBookings
      .filter(b => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + b.total_price, 0);

    const sorted = [...userBookings].sort(
      (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

    return {
      ...user,
      bookings_count: userBookings.length,
      total_spent: spent,
      last_booking: sorted[0]?.start_date ?? null,
    };
  }

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filtered = q
      ? this.customers.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        )
      : [...this.customers];
  }

  openDrawer(customer: CustomerRow): void {
    this.selectedCustomer = customer;
    this.drawerOpen = true;
    this.customerBookings = this.allBookings.filter(b => b.user_id === customer.id);
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selectedCustomer = null;
    this.customerBookings = [];
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
    return this.customers.reduce((sum, c) => sum + c.total_spent, 0);
  }
}