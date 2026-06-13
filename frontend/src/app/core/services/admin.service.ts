import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AdminBooking {
  id: number;
  user_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
}

export interface AdminStats {
  bookings: { total: number; confirmed: number; pending: number; cancelled: number };
  revenue: { total: number };
  vehicles: { total: number; available: number; maintenance: number; unavailable: number };
  customers: { total: number };
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AdminReports {
  revenue_by_type: { type: string; revenue: number }[];
  bookings_by_type: { type: string; count: number }[];
  top_vehicles: { vehicle_id: number; brand: string; model: string; type: string; bookings_count: number }[];
  monthly_revenue: { month: string; revenue: number }[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStats() {
    return this.http.get<AdminStats>(`${this.api}/admin/stats`);
  }

  getBookings() {
    return this.http.get<AdminBooking[]>(`${this.api}/admin/bookings`);
  }

  updateBookingStatus(bookingId: number, status: string) {
    return this.http.put(`${this.api}/admin/bookings/${bookingId}/status`, { status });
  }

  getUsers() {
    return this.http.get<AdminUser[]>(`${this.api}/admin/users`);
  }

  getUser(userId: number) {
    return this.http.get<AdminUser>(`${this.api}/admin/users/${userId}`);
  }

  getUserBookings(userId: number) {
    return this.http.get<AdminBooking[]>(`${this.api}/admin/bookings`).pipe(
      // filter client-side since backend returns all bookings
    );
  }

  getReports() {
    return this.http.get<AdminReports>(`${this.api}/admin/reports`);
  }
}