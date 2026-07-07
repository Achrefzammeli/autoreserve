import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  private auth = inject(AuthService);

  get userId(): number | null {
    return this.auth.getCurrentUserId();
  }

  get role(): string {
    return this.auth.getRole() === 'ADMIN' ? 'Administrateur' : 'Client';
  }

  logout(): void {
    this.auth.logout();
  }
}
