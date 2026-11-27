
import { Component, input } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeCs from '@angular/common/locales/cs';

import type { WeatherData } from '../weather-detail/weather-detail.component';

registerLocaleData(localeCs);

@Component({
  selector: 'app-daily-forecast',
  templateUrl: './daily-forecast.component.html',
  styleUrl: './daily-forecast.component.scss',
  imports: [DatePipe]
})
export class DailyForecastComponent {

  daily = input.required<WeatherData['daily']>();

  getWeatherIcon(code: number): string {
    if (code === 0) return '☀️';
    if (code <= 2) return '⛅';
    if (code === 3) return '☁️';
    if (code <= 48) return '🌫️';
    if (code <= 57) return '🌦️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌧️';
    if (code <= 86) return '🌨️';

    return '⛈️';
  }
}
