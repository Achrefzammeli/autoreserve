import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.api}/auth/register`, data);
  }

  login(data: any) {
    return this.http.post(`${this.api}/auth/login`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
  }
}