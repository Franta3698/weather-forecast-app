import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private readonly STORAGE_KEY = 'favorite-cities';

  async getCities(): Promise<string[]> {
    const { value } = await Preferences.get({
      key: this.STORAGE_KEY
    });

    return value ? JSON.parse(value) : [];
  }

  async addCity(city: string): Promise<void> {
    const cities = await this.getCities();

    if (cities.includes(city)) {
      return;
    }

    cities.push(city);

    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(cities)
    });
  }

  async removeCity(city: string): Promise<void> {
    const cities = (await this.getCities())
      .filter(c => c !== city);

    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(cities)
    });
  }
  async removeCurrentLocation(): Promise<void> {
  const cities = (await this.getCities())
    .filter(city => city !== 'Aktuální poloha');

  await Preferences.set({
    key: this.STORAGE_KEY,
    value: JSON.stringify(cities)
  });
  }
}