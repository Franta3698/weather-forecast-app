import { Component, inject, ChangeDetectorRef } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonItem,
  IonButton,
  IonInput, IonIcon } from '@ionic/angular';

import { GeocodingService } from '../services/geocoding';
import { WeatherService } from '../services/weather';
import { CityService } from '../services/city';
import { CityComponent } from '../components/city/city.component';
import { TemperatureChartComponent } from '../components/temperature-chart/temperature-chart.component';
import { addIcons } from 'ionicons';
import { searchOutline, locateOutline } from 'ionicons/icons';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WeatherDetailComponent } from '../components/weather-detail/weather-detail.component';

const REFRESH_INTERVAL = 10 * 60 * 1000;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonItem,
    IonButton,
    IonInput,
    AsyncPipe,
    CityComponent,
    WeatherDetailComponent],
})
export class Tab1Page {

  constructor() {
  addIcons({
    searchOutline,
    locateOutline
  });
}

  private weatherService = inject(WeatherService);
  private cityService = inject(CityService);
  private geocodingService = inject(GeocodingService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  private refreshSubscription?: Subscription;

  private currentLatitude?: number;
  private currentLongitude?: number;

  private initialized = false;

  selectedCity: string = 'Aktuální poloha';

  weather$?: ReturnType<WeatherService['getForecastByCity']>;

  ionViewWillEnter(): void {
    const city = this.route.snapshot.queryParamMap.get('city');

    if (city) {
      this.changeCity(city);
    } else if (!this.initialized) {
      this.loadWeatherByCurrentLocation();
    } else {
      this.refreshWeather();
    }

    this.initialized = true;

    this.refreshSubscription?.unsubscribe();

    this.refreshSubscription = interval(REFRESH_INTERVAL)
      .subscribe(() => {
        this.refreshWeather();
      });
  }

  ionViewWillLeave(): void {
    this.refreshSubscription?.unsubscribe();
  }

  refreshWeather(): void {
    if (
      this.currentLatitude !== undefined &&
      this.currentLongitude !== undefined
    ) {
      this.weather$ = this.weatherService.getForecast(
        this.currentLatitude,
        this.currentLongitude
      );
    } else if (this.selectedCity !== 'Aktuální poloha') {
      this.weather$ = this.weatherService.getForecastByCity(
        this.selectedCity
      );
    }
  }

  changeCity(newCity: string): void {
    const city = newCity.trim();

    if (!city) return;

    this.selectedCity = city;

    this.currentLatitude = undefined;
    this.currentLongitude = undefined;

    this.weather$ = this.weatherService.getForecastByCity(city);
  }

  async addFavoriteCity(city: string): Promise<void> {
    if (city === 'Aktuální poloha') {
      alert('Nenačtenou polohu nelze přidat mezi oblíbená města.');
      return;
    }

    await this.cityService.addCity(city);

    console.log('Uloženo:', city);
  }

  loadWeatherByCurrentLocation(): void {
    console.log('Získávám aktuální polohu...');

    if (!navigator.geolocation) {
      this.changeCity('Zlín');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        this.currentLatitude = lat;
        this.currentLongitude = lon;

        try {
          this.selectedCity = await firstValueFrom(
            this.geocodingService.getCityByCoordinates(lat, lon)
          );
        } catch (error) {
          console.error('Nepodařilo se zjistit město:', error);
          this.selectedCity = 'Aktuální poloha';
        }

        this.weather$ = this.weatherService.getForecast(lat, lon);

        this.cdr.detectChanges();
      },

      (error) => {
        console.error('Chyba geolokace:', error);

        if (!this.weather$) {
          this.changeCity('Zlín');
        }

        this.cdr.detectChanges();
      },

      {
        timeout: 10000
      }
    );
  }
}
