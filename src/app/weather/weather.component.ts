import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { WeatherService } from '../services/weather.service';
import { showToastOnError } from '../services/error.handler';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnInit {

  public weatherData = [];

  constructor(private weatherService: WeatherService, private toastController: ToastController) {}

  ngOnInit() {
    this.weatherService.getCurrentWeather().subscribe(
      data => this.weatherData = data,
      error => showToastOnError(this.toastController, error),
    );
  }
}
