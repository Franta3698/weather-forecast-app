import { Component, input, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrl: './city.component.scss',
  imports: [IonButton, IonIcon]
})
export class CityComponent {

  cityName = input.required<string>();
  addFavorite = output<string>();

  constructor() {
    addIcons({ heartOutline });
  }

  addToFavorites(): void {
    this.addFavorite.emit(this.cityName());
  }
}