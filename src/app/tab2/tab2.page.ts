const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minut
import { Component, inject, ChangeDetectorRef } from '@angular/core';
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
import { firstValueFrom, retry, interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';
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
  private cdr = inject(ChangeDetectorRef);
  private refreshSubscription?: Subscription;
  private router = inject(Router);

  cities: FavoriteCity[] = [];
  loading = false;


  async ionViewWillEnter(): Promise<void> {
    await this.loadCities();
    console.log('Tab2 se otevřela');
    this.refreshSubscription = interval(REFRESH_INTERVAL)
    .subscribe(() => {
      this.loadCities();
    });
  }

  ionViewWillLeave(): void {
  this.refreshSubscription?.unsubscribe();
  }
  async loadCities(): Promise<void> {
  this.loading = true;

  try {
    const savedCities = await this.cityService.getCities();

    console.log('Uložená města:', savedCities);

    this.cities = await Promise.all(
      savedCities.map(async (name) => {
        try {
          const weather = await firstValueFrom(
            this.weatherService.getForecastByCity(name).pipe(
              retry(2)
            )
            
          );

          console.log(
            `Počasí pro ${name}:`,
            weather.current.temperature_2m
          );

          return {
            name,
            temperature: weather.current.temperature_2m
          };
        } catch (error) {
          console.error(`Chyba při načítání ${name}:`, error);

          return {
            name,
            temperature: null
          };
        }
      })
    );

    console.log('Výsledná města:', this.cities);

  } finally {
    this.loading = false;
    this.cdr.detectChanges();
  }
}

  async removeCity(name: string): Promise<void> {
    await this.cityService.removeCity(name);
    this.cities = this.cities.filter(city => city.name !== name);
  }
 showCity(name: string): void {
  this.router.navigate(['/tabs/tab1'], {
    queryParams: { city: name }
  });
}

}