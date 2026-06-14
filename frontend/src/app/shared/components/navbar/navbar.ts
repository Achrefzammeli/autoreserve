import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  isLoggedIn = false;
  mobileMenuOpen = false;
  logoSrc = 'logocar.png';
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.checkAuth();
  }
  handleLogoError() {
    this.logoSrc = 'logocar.png'; // Fallback image
  }
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  checkAuth() {
    // Logique basée sur votre exemple existant
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigate(['/auth/login']);
  }
}