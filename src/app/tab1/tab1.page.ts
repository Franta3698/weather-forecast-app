import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner, IonList, IonItem, IonNote, IonLabel, IonButton, IonInput } from '@ionic/angular';
import { AsyncPipe } from '@angular/common';
import { WeatherService } from '../services/weather';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonInput, IonButton, IonLabel, IonNote, IonItem, IonList, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, AsyncPipe, IonSpinner],
})
export class Tab1Page {
  private weatherService = inject(WeatherService);
  selectedCity : string = 'Zlín'

  weather$ = this.weatherService.getForecastByCity(this.selectedCity);
  getCity() : string {
    return this.selectedCity;
  }
  changeCity(newCity: string) : void{
    this.selectedCity = newCity;

    this.weather$ = this.weatherService.getForecastByCity(this.selectedCity);
    
  }
}
