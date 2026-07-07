import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  mobileMenuOpen = false;
  logoSrc = 'logocar.png';

  private sub?: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.checkAuth();
    // Re-évalue la session à chaque navigation (login/logout, expiration du token)
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAuth();
        this.mobileMenuOpen = false;
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  get dashboardLink(): string {
    return this.isAdmin ? '/admin/dashboard' : '/client/dashboard';
  }

  handleLogoError() {
    this.logoSrc = 'logocar.png';
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  checkAuth() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
  }

  logout() {
    this.mobileMenuOpen = false;
    this.isLoggedIn = false;
    this.authService.logout();
  }
}
