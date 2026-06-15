import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AdminService,
  AdminBooking
} from '../../../../core/services/admin.service';

interface CustomerRow {
  id: number;
  full_name: string;
  cin: string;
  phone: string;
  email?: string;
  address?: string;

  bookings_count: number;
  total_revenue: number;
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

  selectedCustomer: CustomerRow | null = null;

  drawerOpen = false;

  customerBookings: AdminBooking[] = [];
  private allBookings: AdminBooking[] = [];
  showForm = false;
  editingCustomer: CustomerRow | null = null;

  customerForm = {
    full_name: '',
    cin: '',
    phone: '',
    email: '',
    address: ''
  };
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminService.getCustomers().subscribe({
      next: (customers) => {

        this.customers = customers;
        this.filtered = [...customers];

        this.loading = false;
      },

      error: () => {
        this.errorMessage = 'Failed to load customers.';
        this.loading = false;
      }
    });

    this.adminService.getBookings().subscribe({
      next: bookings => {
        this.allBookings = bookings;
      }
    });
  }

  onSearch(): void {

    const q = this.searchQuery.trim().toLowerCase();

    if (!q) {
      this.filtered = [...this.customers];
      return;
    }

    this.filtered = this.customers.filter(customer =>
      customer.full_name.toLowerCase().includes(q) ||
      customer.cin.toLowerCase().includes(q) ||
      customer.phone.toLowerCase().includes(q)
    );
  }

  openDrawer(customer: CustomerRow): void {

    this.selectedCustomer = customer;

    this.customerBookings = this.allBookings.filter(
      booking => booking.customer_id === customer.id
    );

    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selectedCustomer = null;
    this.customerBookings = [];
  }

  statusClass(status: string): string {

    const classes: Record<string, string> = {
      CONFIRMED: 'chip--success',
      PENDING: 'chip--pending',
      CANCELLED: 'chip--cancelled'
    };

    return classes[status] ?? '';
  }

  get totalRevenue(): number {

    return this.customers.reduce(
      (sum, customer) => sum + customer.total_revenue,
      0
    );
  }
  deleteCustomer(id: number): void {

  if (!confirm('Delete customer ?')) {
    return;
  }

  this.adminService.deleteCustomer(id).subscribe({
    next: () => {
      this.loadData();
    }
  });

}
openCreateForm(): void {

  this.editingCustomer = null;

  this.customerForm = {
    full_name: '',
    cin: '',
    phone: '',
    email: '',
    address: ''
  };

  this.showForm = true;
}

openEditForm(customer: CustomerRow): void {

  this.editingCustomer = customer;

  this.customerForm = {
    full_name: customer.full_name,
    cin: customer.cin,
    phone: customer.phone,
    email: customer.email || '',
    address: customer.address || ''
  };

  this.showForm = true;
}

closeForm(): void {
  this.showForm = false;
}

saveCustomer(): void {

  if (this.editingCustomer) {

    this.adminService.updateCustomer(
      this.editingCustomer.id,
      this.customerForm
    ).subscribe({
      next: () => {
        this.showForm = false;
        this.loadData();
      }
    });

  } else {

    this.adminService.createCustomer(
      this.customerForm
    ).subscribe({
      next: () => {
        this.showForm = false;
        this.loadData();
      }
    });
  }
}
}