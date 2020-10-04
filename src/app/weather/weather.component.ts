import { Component, OnInit } from '@angular/core';
import { addDays, format, startOfToday } from 'date-fns';
import { WeatherService } from '../services/weather.service';

const MAX_DAYS = 3;

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnInit {

  public dailyWeather = [];

  constructor(private weatherService: WeatherService) {}

  getIconUrl(weather: any): string {
    const iconName = weather?.length ? weather[0].icon : '01d';
    return `http://openweathermap.org/img/wn/${iconName}.png`;
  }

  getWeekday(index: number) {
    return format(addDays(startOfToday(), index), 'EEE');
  }

  getDayName(index: number) {
    return format(addDays(startOfToday(), index), 'LLL d');
  }

  ngOnInit() {
    this.weatherService.getCurrentWeather().subscribe(data => {
      console.log(`WeatherComponent -> ngOnInit -> data`, data);
      const { current, daily } = data;
      if (daily) {
        this.dailyWeather = daily.map(({ dt, temp, weather }, index) => ({
          weekday: this.getWeekday(index),
          day: this.getDayName(index),
          temp: Math.round(temp.day),
          high: Math.round(temp.max),
          low: Math.round(temp.min),
          iconUrl: this.getIconUrl(weather),
        })).slice(0, MAX_DAYS);
      }
      if (current) {
        const { temp, weather } = current;
        if (temp !== undefined && this.dailyWeather.length) {
          this.dailyWeather[0].temp = Math.round(temp);
          this.dailyWeather[0].iconUrl = this.getIconUrl(weather);
        }
      }
    });
  }
}
