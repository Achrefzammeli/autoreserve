import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { ActivatedRoute } from '@angular/router';
import { Loading } from '../../../../shared/components/loading/loading';

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [CommonModule, Loading],
  templateUrl: './fleet.html',
  styleUrl: './fleet.css',
})
export class Fleet implements OnInit {

  vehicles: Vehicle[] = [];
  loading = true;

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

ngOnInit(): void {

  this.route.queryParams.subscribe(params => {

    const start = params['start_date'];
    const end = params['end_date'];

    if (start && end) {

      this.loading = true;

      this.vehicleService
        .getAvailableVehicles(start, end)
        .subscribe({
          next: (vehicles) => {
            this.vehicles = vehicles;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });

    } else {

      this.loadVehicles();

    }

  });

}

  loadVehicles(): void {
    this.loading = true;

    this.vehicleService.getAllVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load vehicles', err);
        this.loading = false;
      }
    });
  }

  viewVehicle(id: number): void {
    this.router.navigate(['/vehicles', id]);
  }

  imageUrl(vehicle: Vehicle): string {
    if (!vehicle.image_url) {
      return 'https://via.placeholder.com/600x400?text=Vehicle';
    }

    return vehicle.image_url.startsWith('http')
      ? vehicle.image_url
      : `http://localhost:8000${vehicle.image_url}`;
  }

  statusLabel(status: string): string {
    return status.replace('_', ' ');
  }
}