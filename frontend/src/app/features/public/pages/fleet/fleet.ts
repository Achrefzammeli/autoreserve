import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { Loading } from '../../../../shared/components/loading/loading';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [CommonModule, FormsModule, Loading],
  templateUrl: './fleet.html',
  styleUrl: './fleet.css',
})
export class Fleet implements OnInit {

  vehicles: Vehicle[] = [];
  filtered: Vehicle[] = [];
  loading = true;

  searchQuery = '';
  statusFilter: 'ALL' | 'AVAILABLE' = 'ALL';

  // Dates transmises depuis la recherche de la page d'accueil
  startDate: string | null = null;
  endDate: string | null = null;

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.startDate = params['start_date'] ?? null;
      this.endDate = params['end_date'] ?? null;

      if (this.startDate && this.endDate) {
        this.loading = true;
        this.vehicleService.getAvailableVehicles(this.startDate, this.endDate).subscribe({
          next: (vehicles) => { this.vehicles = vehicles; this.applyFilters(); this.loading = false; },
          error: () => { this.loading = false; }
        });
      } else {
        this.loadVehicles();
      }
    });
  }

  loadVehicles(): void {
    this.loading = true;
    this.vehicleService.getAllVehicles().subscribe({
      next: (data) => { this.vehicles = data; this.applyFilters(); this.loading = false; },
      error: (err) => { console.error('Failed to load vehicles', err); this.loading = false; }
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filtered = this.vehicles.filter(v => {
      const matchesQuery = !q || `${v.brand} ${v.model}`.toLowerCase().includes(q);
      const matchesStatus = this.statusFilter === 'ALL' || v.status === 'AVAILABLE';
      return matchesQuery && matchesStatus;
    });
  }

  clearDates(): void {
    this.router.navigate(['/fleet']);
  }

  viewVehicle(id: number): void {
    this.router.navigate(['/vehicles', id]);
  }

  get availableCount(): number {
    return this.vehicles.filter(v => v.status === 'AVAILABLE').length;
  }

  imageUrl(vehicle: Vehicle): string | null {
    if (!vehicle.image_url) return null;
    return vehicle.image_url.startsWith('http')
      ? vehicle.image_url
      : `${environment.apiUrl}${vehicle.image_url}`;
  }

  statusChip(status: string): string {
    return {
      AVAILABLE: 'chip-success',
      MAINTENANCE: 'chip-warning',
      UNAVAILABLE: 'chip-danger',
    }[status] ?? 'chip-neutral';
  }

  statusLabel(status: string): string {
    return {
      AVAILABLE: 'Disponible',
      MAINTENANCE: 'En maintenance',
      UNAVAILABLE: 'Indisponible',
    }[status] ?? status;
  }
}
