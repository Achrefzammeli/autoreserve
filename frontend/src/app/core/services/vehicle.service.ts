import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Vehicle, VehicleCreatePayload } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllVehicles() {
    return this.http.get<Vehicle[]>(`${this.api}/vehicles`);
  }
  getVehicleById(id: number) {
    return this.http.get(`${this.api}/vehicles/${id}`);
  }
  createVehicle(data: VehicleCreatePayload) {
    return this.http.post<Vehicle>(`${this.api}/vehicles/`, data);
  }

  deleteVehicle(vehicleId: number) {
    return this.http.delete<{ message: string }>(`${this.api}/vehicles/${vehicleId}`);
  }
}