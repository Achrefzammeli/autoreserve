import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private vehicleService = inject(VehicleService);

  suggestions: Vehicle[] = [];
  loadingSuggestions = true;

  ngOnInit(): void {
    // Suggestions : quelques véhicules disponibles
    this.vehicleService.getAllVehicles().subscribe({
      next: (vehicles) => {
        this.suggestions = vehicles
          .filter(v => v.status === 'AVAILABLE')
          .slice(0, 3);
        this.loadingSuggestions = false;
      },
      error: () => { this.loadingSuggestions = false; }
    });
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 5) return 'Bonsoir';
    if (h < 18) return 'Bonjour';
    return 'Bonsoir';
  }

  imageUrl(vehicle: Vehicle): string | null {
    if (!vehicle.image_url) return null;
    return vehicle.image_url.startsWith('http')
      ? vehicle.image_url
      : `${environment.apiUrl}${vehicle.image_url}`;
  }
}
