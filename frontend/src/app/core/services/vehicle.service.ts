import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Vehicle, VehicleFormData } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllVehicles() {
    return this.http.get<Vehicle[]>(`${this.api}/vehicles`);
  }

  getVehicleById(id: number) {
    return this.http.get<Vehicle>(`${this.api}/vehicles/${id}`);
  }

  createVehicle(data: VehicleFormData) {
    const form = this.toFormData(data);
    return this.http.post<Vehicle>(`${this.api}/vehicles/`, form);
  }

  updateVehicle(id: number, data: VehicleFormData) {
    const form = this.toFormData(data);
    return this.http.put<Vehicle>(`${this.api}/vehicles/${id}`, form);
  }

  deleteVehicle(id: number) {
    return this.http.delete<{ message: string }>(`${this.api}/vehicles/${id}`);
  }

  private toFormData(data: VehicleFormData): FormData {
    const form = new FormData();
    form.append('brand',         data.brand);
    form.append('model',         data.model);
    form.append('price_per_day', data.price_per_day.toString());
    form.append('status',        data.status);
    if (data.specs)  form.append('specs', data.specs);
    if (data.image)  form.append('image', data.image);
    return form;
  }
  getAvailableVehicles(
  startDate: string,
  endDate: string
) {
  return this.http.get<Vehicle[]>(
    `${this.api}/vehicles/available/`,
    {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    }
  );
}
getBookedDates(vehicleId: number) {
  return this.http.get<any[]>(
    `${this.api}/vehicles/${vehicleId}/booked-dates`
  );
}
}