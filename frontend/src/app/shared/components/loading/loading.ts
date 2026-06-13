import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading {
  // Optionnel : permet de changer le texte depuis le parent
  // Exemple : <app-loading message="Connexion en cours..."></app-loading>
  @Input() message: string = "Recherche des meilleurs véhicules";
}