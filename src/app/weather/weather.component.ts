import { Component, OnInit } from '@angular/core';
import { addDays, format, startOfToday } from 'date-fns';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnInit {

  private MAX_DAYS = 3;

  public current = {
    temp: 0,
    iconName: 'sunny-outline',
  };
  public dailyWeather = [];

  constructor(private weatherService: WeatherService) {}

  getIconName(weather: any): string {
    let iconName = 'sunny-outline';
    if (weather && weather.length) {
      const { icon } = weather[0];
      switch (icon.substring(0, 2)) {
        default:
          console.log(`WeatherComponent -> getIconName -> icon`, icon);
          iconName = 'information-outline';
          break;

        case '01':
          iconName = 'sunny-outline';
          break;

        case '02':
          iconName = 'partly-sunny-outline';
          break;

        case '03':
        case '04':
          iconName = 'cloudy-outline';
          break;

        case '09':
        case '10':
          iconName = 'rainy-outline';
          break;

        case '11':
          iconName = 'thunderstorm-outline';
          break;

        case '13':
          iconName = 'snow-outline';
          break;
      }
    }
    return iconName;
  }

  getWeekday(index) {
    return format(addDays(startOfToday(), index), 'EEE');
  }

  getDayName(index) {
    return format(addDays(startOfToday(), index), 'LLL d');
  }

  ngOnInit() {
    this.weatherService.getCurrentWeather().subscribe(data => {
      console.log(`WeatherComponent -> ngOnInit -> data`, data);
      const { current, daily } = data;
      if (daily) {
        this.dailyWeather = daily.map(({ dt, temp, weather }, index) => ({
          weekday: this.getWeekday(index),
          name: this.getDayName(index),
          temp: Math.round(temp.day),
          high: Math.round(temp.max),
          low: Math.round(temp.min),
          iconName: this.getIconName(weather),
        })).slice(0, this.MAX_DAYS);
      }
      if (current) {
        const { temp, weather } = current;
        if (temp !== undefined && this.dailyWeather.length) {
          this.dailyWeather[0].temp = Math.round(temp);
          this.dailyWeather[0].iconName = this.getIconName(weather);
        }
      }
    });
  }
}
