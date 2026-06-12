import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle, VehicleCreatePayload } from '../../../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class Vehicles implements OnInit {

  private fb = inject(FormBuilder);
  vehicles: Vehicle[] = [];
  loading = false;
  saving = false;
  errorMessage = '';

  form = this.fb.group({
    brand: ['', [Validators.required]],
    model: ['', [Validators.required]],
    type: ['SUV', [Validators.required]],
    price_per_day: [0, [Validators.required, Validators.min(1)]],
    status: ['AVAILABLE', [Validators.required]],
    image_url: [''],
    specs: ['']
  });

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;
    this.errorMessage = '';

    this.vehicleService.getAllVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les véhicules.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const payload = this.buildPayload();

    this.vehicleService.createVehicle(payload).subscribe({
      next: () => {
        this.form.reset({
          brand: '',
          model: '',
          type: 'SUV',
          price_per_day: 0,
          status: 'AVAILABLE',
          image_url: '',
          specs: ''
        });
        this.saving = false;
        this.loadVehicles();
      },
      error: () => {
        this.errorMessage = 'Impossible de créer le véhicule.';
        this.saving = false;
      }
    });
  }

  deleteVehicle(vehicleId: number): void {
    const confirmed = window.confirm('Supprimer ce véhicule ?');

    if (!confirmed) {
      return;
    }

    this.vehicleService.deleteVehicle(vehicleId).subscribe({
      next: () => this.loadVehicles(),
      error: () => {
        this.errorMessage = 'Impossible de supprimer ce véhicule.';
      }
    });
  }

  get availableCount(): number {
    return this.vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE').length;
  }

  get maintenanceCount(): number {
    return this.vehicles.filter((vehicle) => vehicle.status === 'MAINTENANCE').length;
  }

  get unavailableCount(): number {
    return this.vehicles.filter((vehicle) => vehicle.status === 'UNAVAILABLE').length;
  }

  statusLabel(status: Vehicle['status']): string {
    return status.replace('_', ' ');
  }

  statusClass(status: Vehicle['status']): string {
    return `vehicle-status--${status.toLowerCase()}`;
  }

  private buildPayload(): VehicleCreatePayload {
    const rawValue = this.form.getRawValue();

    return {
      brand: rawValue.brand ?? '',
      model: rawValue.model ?? '',
      type: rawValue.type ?? 'SUV',
      price_per_day: Number(rawValue.price_per_day ?? 0),
      status: (rawValue.status ?? 'AVAILABLE') as VehicleCreatePayload['status'],
      image_url: rawValue.image_url?.trim() ? rawValue.image_url.trim() : null,
      specs: rawValue.specs?.trim() ? rawValue.specs.trim() : null
    };
  }

}
