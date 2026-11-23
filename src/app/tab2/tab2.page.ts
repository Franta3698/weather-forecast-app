import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonSpinner
} from '@ionic/angular';

import { WeatherService } from '../services/weather';
import { CityService } from '../services/city';
import { firstValueFrom } from 'rxjs';

interface FavoriteCity {
  name: string;
  temperature: number | null;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonSpinner
  ],
})
export class Tab2Page {
  private cityService = inject(CityService);
  private weatherService = inject(WeatherService);

  cities: FavoriteCity[] = [];
  loading = false;


  async ionViewWillEnter(): Promise<void> {
    await this.loadCities();
  }

  async loadCities(): Promise<void> {
    this.loading = true;

    try {
      const savedCities = await this.cityService.getCities();

      this.cities = await Promise.all(
        savedCities.map(async (name) => {
          try {
            const weather = await firstValueFrom(
              this.weatherService.getForecastByCity(name)
            );

            return {
              name,
              temperature: weather.current.temperature_2m
            };
          } catch {
            return {
              name,
              temperature: null
            };
          }
        })
      );
    } finally {
      this.loading = false;
    }
  }

  async removeCity(name: string): Promise<void> {
    await this.cityService.removeCity(name);
    this.cities = this.cities.filter(city => city.name !== name);
  }
}