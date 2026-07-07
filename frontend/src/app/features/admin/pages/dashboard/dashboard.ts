import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminStats, AdminBooking } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private adminService = inject(AdminService);

  stats: AdminStats | null = null;
  recentBookings: AdminBooking[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load dashboard stats.';
        this.loading = false;
      }
    });

    this.adminService.getBookings().subscribe({
      next: (bookings) => {
        this.recentBookings = bookings.slice(0, 6);
      }
    });
  }

  get fleetUtilizationPct(): number {
    if (!this.stats) return 0;
    const { total, available } = this.stats.vehicles;
    if (total === 0) return 0;
    return Math.round(((total - available) / total) * 100);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED: 'chip-success',
      PENDING: 'chip-warning',
      CANCELLED: 'chip-danger',
    };
    return map[status] ?? '';
  }
}