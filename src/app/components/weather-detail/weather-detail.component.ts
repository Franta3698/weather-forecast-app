
import { Component, input, computed } from '@angular/core';

import { TemperatureChartComponent } from '../temperature-chart/temperature-chart.component';
import { DailyForecastComponent } from '../daily-forecast/daily-forecast.component';

import type { WeatherService } from '../../services/weather';
import type { ObservedValueOf } from 'rxjs';

export type WeatherData = ObservedValueOf<
  ReturnType<WeatherService['getForecastByCity']>
>;

@Component({
  selector: 'app-weather-detail',
  templateUrl: './weather-detail.component.html',
  styleUrl: './weather-detail.component.scss',
  imports: [
    TemperatureChartComponent,
    DailyForecastComponent
  ]
})
export class WeatherDetailComponent {

  weather = input.required<WeatherData>();

  temperatures = computed(() =>
    this.weather().hourly.temperature_2m.slice(0, 24)
  );

  times = computed(() =>
    this.weather().hourly.time
      .slice(0, 24)
      .map(t => t.substring(11, 16))
  );
}
