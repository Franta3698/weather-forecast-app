
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';

export interface GeocodingResponse {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
  }[];
}
export interface WeatherResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
 hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    weather_code: number[];
    wind_speed_10m: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}
@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private http = inject(HttpClient);

  getForecast(latitude: number, longitude: number): Observable<WeatherResponse> {

    const params = new HttpParams()
    .set('latitude', latitude)
    .set('longitude', longitude)
    .set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m')
    .set('hourly', 'temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m')
    .set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
    .set('timezone', 'auto')
    .set('forecast_days', 7);

    return this.http.get<WeatherResponse>(
    'https://api.open-meteo.com/v1/forecast',
    { params }
    );
  }
  getForecastByCity(cityName: string): Observable<WeatherResponse> {
  const params = new HttpParams()
    .set('name', cityName)
    .set('count', 1)
    .set('language', 'cs')
    .set('format', 'json');

  return this.http.get<GeocodingResponse>(
    'https://geocoding-api.open-meteo.com/v1/search',
    { params }
  ).pipe(
    switchMap(response => {
      const city = response.results?.[0];

      if (!city) {
        return throwError(() => new Error('Město nebylo nalezeno'));
      }

      return this.getForecast(city.latitude, city.longitude);
    })
  );
}
}
