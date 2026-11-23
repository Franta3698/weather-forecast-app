const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minut
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
import { GeocodingService } from '../services/geocoding';
import { firstValueFrom, interval, Subscription } from 'rxjs';
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
  private geocodingService = inject(GeocodingService);
  private refreshSubscription?: Subscription;
  selectedCity: string = '';

  weather$ = this.weatherService.getForecastByCity(this.selectedCity);
  ionViewWillEnter(): void {
    this.loadWeatherByCurrentLocation();
    this.refreshSubscription = interval(REFRESH_INTERVAL)
      .subscribe(() => {
        this.refreshWeather();
      });
  }

  refreshWeather(): void {
  this.weather$ = this.weatherService.getForecastByCity(
    this.selectedCity
  );
}
ionViewWillLeave(): void {
  this.refreshSubscription?.unsubscribe();
}
  getCity(): string {
    return this.selectedCity;
  }

  changeCity(newCity: string): void {
    this.selectedCity = newCity;
    this.weather$ = this.weatherService.getForecastByCity(this.selectedCity);
  }

  async addFavoriteCity(city: string): Promise<void> {
    if (city === 'Aktuální poloha') {
    alert('nenačtenou polohu nezle přidat mezi oblíbená města.');
    return;
  }
    console.log('Přijaté město:', city);
    await this.cityService.addCity(city);
    console.log('Uloženo!');
  }

  async loadWeatherByCurrentLocation(): Promise<void> {
  if (!navigator.geolocation) {
    alert('Geolokace není podporována.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const cityName = await firstValueFrom(
          this.geocodingService.getCityByCoordinates(lat, lon)
        );
        console.log('Zjištěné město:', cityName);

        this.selectedCity = cityName;

        this.weather$ = this.weatherService.getForecast(lat, lon);

      } catch (error) {
        console.error('Chyba při zjišťování lokality:', error);
        alert('Nepodařilo se zjistit název lokality.');
      }
    },
    (error) => {
      console.error('Nepodařilo se získat polohu:', error);
      alert('Nepodařilo se zjistit vaši polohu.');
    }
  );
}
}