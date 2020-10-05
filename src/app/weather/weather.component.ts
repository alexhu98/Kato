import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
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

  constructor(private weatherService: WeatherService, private toastController: ToastController) {}

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
    this.weatherService.getCurrentWeather().subscribe(
      data => this.dailyWeather = data,
      async (error) => {
        console.log(`WeatherComponent -> ngOnInit -> error`, error)
        const toast = await this.toastController.create({
          message: error,
          duration: 3000,
        });
        toast.present();
      }
    );
  }
}
