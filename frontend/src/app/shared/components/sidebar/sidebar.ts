import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  private auth = inject(AuthService);

  drawerOpen = signal(false);

  toggleDrawer() {
    this.drawerOpen.update(v => !v);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  logout() {
    this.auth.logout();
  }
}