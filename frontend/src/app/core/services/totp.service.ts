import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface TOTPSetupResponse {
  status: 'setup_required' | 'already_setup';
  qr_code?: string;
  secret?: string;
  message: string;
}

export interface TOTPVerifyResponse {
  status: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class TotpService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  setup(email: string) {
    return this.http.post<TOTPSetupResponse>(`${this.api}/totp/setup`, { email });
  }

  verify(email: string, code: string) {
    return this.http.post<TOTPVerifyResponse>(`${this.api}/totp/verify`, { email, code });
  }

  resetPassword(email: string, code: string, new_password: string) {
    return this.http.post(`${this.api}/totp/reset-password`, { email, code, new_password });
  }
}   