import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BookingService } from '../../../../core/services/booking.service';

interface ClientBooking {
  id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings implements OnInit {

  private bookingService = inject(BookingService);

  bookings: ClientBooking[] = [];
  loading = true;
  loadError = false;

  ngOnInit(): void {
    this.bookingService.myBookings().subscribe({
      next: (data: any) => {
        this.bookings = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: () => {
        // L'historique n'est pas disponible : on affiche un état vide élégant
        this.loadError = true;
        this.loading = false;
      }
    });
  }

  statusChip(status: string): string {
    return {
      CONFIRMED: 'chip-success',
      PENDING: 'chip-warning',
      CANCELLED: 'chip-danger',
    }[status] ?? 'chip-neutral';
  }

  statusLabel(status: string): string {
    return {
      CONFIRMED: 'Confirmée',
      PENDING: 'En attente',
      CANCELLED: 'Annulée',
    }[status] ?? status;
  }
}
