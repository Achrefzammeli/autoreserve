import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminReports } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {

  private adminService = inject(AdminService);

  reports: AdminReports | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.adminService.getReports().subscribe({
      next: (data) => {
        this.reports = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load reports.';
        this.loading = false;
      }
    });
  }

  get maxMonthlyRevenue(): number {
    if (!this.reports?.monthly_revenue.length) return 1;
    return Math.max(...this.reports.monthly_revenue.map(m => m.revenue));
  }

  get maxTypeRevenue(): number {
    if (!this.reports?.revenue_by_type.length) return 1;
    return Math.max(...this.reports.revenue_by_type.map(t => t.revenue));
  }

  get totalRevenue(): number {
    return this.reports?.revenue_by_type.reduce((s, t) => s + t.revenue, 0) ?? 0;
  }

  barHeight(value: number, max: number): number {
    if (!max) return 0;
    return Math.round((value / max) * 100);
  }

  formatMonth(ym: string): string {
    const [year, month] = ym.split('-');
    const d = new Date(+year, +month - 1);
    return d.toLocaleString('default', { month: 'short' });
  }
}