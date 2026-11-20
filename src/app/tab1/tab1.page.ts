import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner
} from '@ionic/angular';

import { AsyncPipe } from '@angular/common';
import { WeatherService } from '../services/weather';

import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, AsyncPipe, IonSpinner],
})
export class Tab1Page {
  private weatherService = inject(WeatherService);

  weather$ = this.weatherService.getForecast(
    49.2244,
    17.6628
  );
  constructor() {}
}
