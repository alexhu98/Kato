import { Component } from '@angular/core';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent {

  weather$ = this.weatherService.weather$;

  constructor(
    private weatherService: WeatherService,
  ) {}
}
