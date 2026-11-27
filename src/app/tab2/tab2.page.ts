import { Component, inject, ChangeDetectorRef } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonButton,
  IonSpinner,
  IonAccordion,
  IonAccordionGroup, IonList } from '@ionic/angular';

import { WeatherService } from '../services/weather';
import { CityService } from '../services/city';

import {
  WeatherDetailComponent,
  WeatherData
} from '../components/weather-detail/weather-detail.component';

import {
  firstValueFrom,
  retry,
  interval,
  Subscription
} from 'rxjs';

const REFRESH_INTERVAL = 10 * 60 * 1000;

interface FavoriteCity {
  name: string;
  weather: WeatherData | null;
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
    IonItem,
    IonLabel,
    IonButton,
    IonSpinner,
    IonAccordion,
    IonAccordionGroup,
    WeatherDetailComponent
  ],
})
export class Tab2Page {

  private cityService = inject(CityService);
  private weatherService = inject(WeatherService);
  private cdr = inject(ChangeDetectorRef);

  private refreshSubscription?: Subscription;

  cities: FavoriteCity[] = [];

  loading = false;
  loadError = '';

  expandedCity?: string;

  ionViewWillEnter(): void {

    this.loadCities();

    this.refreshSubscription?.unsubscribe();

    this.refreshSubscription = interval(REFRESH_INTERVAL)
      .subscribe(() => {
        this.loadCities();
      });
  }

  ionViewWillLeave(): void {
    this.refreshSubscription?.unsubscribe();
  }

  async loadCities(): Promise<void> {

    if (this.loading) return;

    this.loading = true;
    this.loadError = '';

    try {

      const savedCities = await this.cityService.getCities();

      this.cities = await Promise.all(

        savedCities.map(async (name) => {

          try {

            const weather = await firstValueFrom(
              this.weatherService.getForecastByCity(name).pipe(
                retry(2)
              )
            );

            return {
              name,
              weather
            };

          } catch (error) {

            console.error(
              `Chyba při načítání ${name}:`,
              error
            );

            return {
              name,
              weather: null
            };
          }
        })
      );

      if (!this.cities.some(city => city.name === this.expandedCity)) {
        this.expandedCity = undefined;
      }

    } catch (error) {

      console.error('Nepodařilo se načíst města:', error);
      this.loadError = 'Nepodařilo se načíst oblíbená města.';

    } finally {

      this.loading = false;
      this.cdr.detectChanges();

    }
  }

  onAccordionChange(event: Event): void {

    if (event.target !== event.currentTarget) return;

    const value = (
      event as CustomEvent<{ value?: string }>
    ).detail.value;

    this.expandedCity = value;
  }

  async removeCity(name: string): Promise<void> {

    await this.cityService.removeCity(name);

    this.cities = this.cities.filter(
      city => city.name !== name
    );

    if (this.expandedCity === name) {
      this.expandedCity = undefined;
    }

    this.cdr.detectChanges();
  }
}
