import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isAdmin()) {
    return true;
  }

  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // logged in but not ADMIN → redirect to client dashboard
  router.navigate(['/client/dashboard']);
  return false;
};