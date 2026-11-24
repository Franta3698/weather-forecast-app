const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minut
import { Component, inject, ChangeDetectorRef} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonItem,
  IonButton,
  IonInput
} from '@ionic/angular';
import { GeocodingService } from '../services/geocoding';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { WeatherService } from '../services/weather';
import { CityService } from '../services/city';
import { CityComponent } from '../components/city/city.component';
import { TemperatureChartComponent } from '../components/temperature-chart/temperature-chart.component';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonButton, IonHeader, 
    IonInput,
    IonButton,
    IonItem,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    AsyncPipe,
    IonSpinner,
    CityComponent,
    TemperatureChartComponent
  ],
})
export class Tab1Page {
  private weatherService = inject(WeatherService);
  private cityService = inject(CityService);
  private geocodingService = inject(GeocodingService);
  private refreshSubscription?: Subscription;
  private currentLatitude?: number;
  private currentLongitude?: number;
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  selectedCity: string = 'Zlín';

  weather$ = this.weatherService.getForecastByCity(this.selectedCity);
ionViewWillEnter(): void {
  const city = this.route.snapshot.queryParamMap.get('city');

  if (city) {
    this.changeCity(city);
  } else {
    this.refreshWeather();
  }

  this.refreshSubscription?.unsubscribe();

  this.refreshSubscription = interval(REFRESH_INTERVAL)
    .subscribe(() => {
      this.refreshWeather();
    });
}
refreshWeather(): void {
  if (this.currentLatitude !== undefined &&
      this.currentLongitude !== undefined) {

    this.weather$ = this.weatherService.getForecast(
      this.currentLatitude,
      this.currentLongitude
    );

  } else {
    this.weather$ = this.weatherService.getForecastByCity(
      this.selectedCity
    );
  }
}
ionViewWillLeave(): void {
  this.refreshSubscription?.unsubscribe();
}

 changeCity(newCity: string): void {
  const city = newCity.trim();

  if (!city) return;

  this.weather$ = this.weatherService.getForecastByCity(city);
  this.selectedCity = city;

  this.currentLatitude = undefined;
  this.currentLongitude = undefined;
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
  console.log('Získávám aktuální polohu...');

  if (!navigator.geolocation) {
    alert('Geolokace není podporována.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      console.log('GPS souřadnice získány:', lat, lon);

      this.currentLatitude = lat;
      this.currentLongitude = lon;

      try {
        const cityName = await firstValueFrom(
          this.geocodingService.getCityByCoordinates(lat, lon)
          
        );

        this.selectedCity = cityName;

        console.log('Zjištěné město:', cityName);

        this.weather$ = this.weatherService.getForecast(lat, lon);
        console.log('Počasí přepnuto na GPS souřadnice');

        this.cdr.detectChanges();

      } catch (error) {
        console.error('Chyba:', error);
      }
    },
    (error) => {
      console.error('Chyba geolokace:', error);
      alert('Nepodařilo se získat polohu.');
    }
  );
}
}