import { Routes } from '@angular/router';

import { PublicLayout } from './layouts/public-layout/public-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { ClientLayout } from './layouts/client-layout/client-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Home } from './features/public/pages/home/home';
import { Fleet } from './features/public/pages/fleet/fleet';
import { About } from './features/public/pages/about/about';
import { Contact } from './features/public/pages/contact/contact';

import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';

import { Dashboard as ClientDashboard } from './features/client/pages/dashboard/dashboard';
import { Profile } from './features/client/pages/profile/profile';
import { Bookings as ClientBookings } from './features/client/pages/bookings/bookings';

import { Dashboard as AdminDashboard } from './features/admin/pages/dashboard/dashboard';
import { Vehicles } from './features/admin/pages/vehicles/vehicles';
import { Customers } from './features/admin/pages/customers/customers';
import { Reports } from './features/admin/pages/reports/reports';
import { ForgotPassword } from './features/auth/pages/forgot-password/forgot-password';
import { Bookings as AdminBookings }
from './features/admin/pages/bookings/bookings';
export const routes: Routes = [

  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home },
      { path: 'fleet', component: Fleet },
      { path: 'about', component: About },
      { path: 'contact', component: Contact }
    ]
  },

  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'forgot-password', component: ForgotPassword }
    ]
  },

  {
    path: 'client',
    component: ClientLayout,
    children: [
      { path: 'dashboard', component: ClientDashboard },
      { path: 'bookings', component: ClientBookings },
      { path: 'profile', component: Profile }
    ]
  },

  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'vehicles', component: Vehicles },
      { path: 'bookings', component: AdminBookings },
      { path: 'customers', component: Customers },
      { path: 'reports', component: Reports }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }

];