import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonList,
  IonItem,
  IonNote,
  IonLabel,
  IonButton,
  IonInput
} from '@ionic/angular';

import { AsyncPipe } from '@angular/common';
import { WeatherService } from '../services/weather';
import { CityService } from '../services/city';
import { CityComponent } from '../components/city/city.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonButton, IonHeader, 
    IonInput,
    IonButton,
    IonLabel,
    IonNote,
    IonItem,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    AsyncPipe,
    IonSpinner,
    CityComponent
  ],
})
export class Tab1Page {
  private weatherService = inject(WeatherService);
  private cityService = inject(CityService);

  selectedCity: string = 'Zlín';

  weather$ = this.weatherService.getForecastByCity(this.selectedCity);

  getCity(): string {
    return this.selectedCity;
  }

  changeCity(newCity: string): void {
    this.selectedCity = newCity;
    this.weather$ = this.weatherService.getForecastByCity(this.selectedCity);
  }

  async addFavoriteCity(city: string): Promise<void> {
    console.log('Přijaté město:', city);
    await this.cityService.addCity(city);
    console.log('Uloženo!');
  }

  loadWeatherByCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          this.selectedCity = 'Aktuální poloha';
          this.weather$ = this.weatherService.getForecast(lat, lon);
        },
        (error) => {
          console.error('Nepodařilo se získat polohu:', error);
          alert('Nepodařilo se zjistit vaši polohu.');
        }
      );
    } else {
      alert('Geolokace není podporována.');
    }
  }
}