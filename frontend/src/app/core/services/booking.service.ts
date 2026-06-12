import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createBooking(data: any) {
    return this.http.post(`${this.api}/bookings`, data);
  }

  myBookings() {
    return this.http.get(`${this.api}/bookings/my`);
  }
}