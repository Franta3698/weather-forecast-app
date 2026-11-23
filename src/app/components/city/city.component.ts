import { Component, input, output } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton
} from '@ionic/angular';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrl: './city.component.scss',
  imports: [
    IonButton
  ]
})
export class CityComponent {
  cityName = input.required<string>();

  addFavorite = output<string>();

  addToFavorites(): void {
    this.addFavorite.emit(this.cityName());
  }
}