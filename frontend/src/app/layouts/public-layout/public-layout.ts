import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [Navbar, RouterOutlet, Footer],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
})
export class PublicLayout {

}
