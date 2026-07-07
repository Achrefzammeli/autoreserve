import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [Navbar, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css',
})
export class ClientLayout {

}
