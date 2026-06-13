import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle, VehicleFormData } from '../../../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class Vehicles implements OnInit {

  private fb             = inject(FormBuilder);
  private vehicleService = inject(VehicleService);

  vehicles:     Vehicle[] = [];
  loading       = false;
  saving        = false;
  errorMessage  = '';

  // image upload
  selectedImage  = signal<File | null>(null);
  imagePreview   = signal<string | null>(null);

  // edit mode
  editingId      = signal<number | null>(null);

  form = this.fb.group({
    brand:         ['', Validators.required],
    model:         ['', Validators.required],
    price_per_day: [0, [Validators.required, Validators.min(1)]],
    status:        ['AVAILABLE', Validators.required],
    specs:         [''],
  });

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;
    this.errorMessage = '';

    this.vehicleService.getAllVehicles().subscribe({
      next:  (v) => { this.vehicles = v; this.loading = false; },
      error: ()  => { this.errorMessage = 'Failed to load vehicles.'; this.loading = false; }
    });
  }

  // ── Image picker ─────────────────────────────────────────────────

  onImagePicked(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedImage.set(file);
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
  }

  // ── Submit (create or update) ─────────────────────────────────────

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving = true;
    this.errorMessage = '';

    const raw = this.form.getRawValue();

    const payload: VehicleFormData = {
      brand:         raw.brand ?? '',
      model:         raw.model ?? '',
      price_per_day: Number(raw.price_per_day ?? 0),
      status:        (raw.status ?? 'AVAILABLE') as VehicleFormData['status'],
      specs:         raw.specs?.trim() || null,
      image:         this.selectedImage(),
    };

    const request$ = this.editingId()
      ? this.vehicleService.updateVehicle(this.editingId()!, payload)
      : this.vehicleService.createVehicle(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.saving = false;
        this.loadVehicles();
      },
      error: () => {
        this.errorMessage = 'Failed to save vehicle.';
        this.saving = false;
      }
    });
  }

  // ── Edit ──────────────────────────────────────────────────────────

  editVehicle(v: Vehicle): void {
    this.editingId.set(v.id);
    this.form.patchValue({
      brand:         v.brand,
      model:         v.model,
      price_per_day: v.price_per_day,
      status:        v.status,
      specs:         v.specs ?? '',
    });
    // show existing image as preview
    this.imagePreview.set(v.image_url ? `http://localhost:8000${v.image_url}` : null);
    this.selectedImage.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  // ── Delete ────────────────────────────────────────────────────────

  deleteVehicle(id: number): void {
    if (!window.confirm('Delete this vehicle?')) return;

    this.vehicleService.deleteVehicle(id).subscribe({
      next:  () => this.loadVehicles(),
      error: () => { this.errorMessage = 'Failed to delete vehicle.'; }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────

  private resetForm(): void {
    this.form.reset({ brand: '', model: '', price_per_day: 0, status: 'AVAILABLE', specs: '' });
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    this.editingId.set(null);
  }

  get availableCount():    number { return this.vehicles.filter(v => v.status === 'AVAILABLE').length; }
  get maintenanceCount():  number { return this.vehicles.filter(v => v.status === 'MAINTENANCE').length; }
  get unavailableCount():  number { return this.vehicles.filter(v => v.status === 'UNAVAILABLE').length; }

  statusLabel(status: string): string { return status.replace('_', ' '); }
  statusClass(status: string): string { return `vehicle-status--${status.toLowerCase()}`; }

  imageUrl(v: Vehicle): string | null {
    if (!v.image_url) return null;
    return v.image_url.startsWith('http') ? v.image_url : `http://localhost:8000${v.image_url}`;
  }
}