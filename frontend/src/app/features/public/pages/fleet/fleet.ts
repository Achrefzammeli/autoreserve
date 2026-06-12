import { Component, OnInit } from '@angular/core';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fleet.html',
  styleUrl: './fleet.css',
})
export class Fleet implements OnInit {

  vehicles: any[] = [];
  loading = true;

  constructor(private vehicleService: VehicleService) {}

    ngOnInit() {
      this.loadVehicles();
    }

    loadVehicles() {
      this.vehicleService.getAllVehicles().subscribe({
        next: (data: any) => {
          this.vehicles = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    }
}
