import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { SubSink } from 'subsink'
import { WeatherService } from '../services/weather.service';
import { showToastOnError } from '../services/error.handler';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnInit, OnDestroy {

  public weatherData = [];
  private subs = new SubSink()

  constructor(private weatherService: WeatherService, private toastController: ToastController) {}

  ngOnInit() {
    this.subs.add(this.weatherService.getCurrentWeather().subscribe(
      data => this.weatherData = data,
      error => showToastOnError(this.toastController, error),
    ));
  }

  ngOnDestroy() {
    this.subs.unsubscribe()
  }
}
