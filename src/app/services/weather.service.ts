import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { addDays, format, startOfToday } from 'date-fns';
import { handleError } from './error.handler'

const LAT = '34.28';
const LON = '-118.88';
const APP_ID = 'e6b1a8915b1d79330d9c272f1b2394eb';
const OPEN_WEATHER_URL = `http://api.openweathermap.org/data/2.5/onecall?lat=${LAT}&lon=${LON}&exclude=minutely,hourly&units=imperial&appid=${APP_ID}`;
const MAX_DAYS = 3;
const ONE_HOUR = 60 * 60 * 1000;

const getIconUrl = (weather: any): string => {
  const iconName = weather?.length ? weather[0].icon : '01d';
  return `http://openweathermap.org/img/wn/${iconName}.png`;
}

const getWeekday = (index: number): string => {
  return format(addDays(startOfToday(), index), 'EEE');
}

const getDayName = (index: number): string => {
  return index === 0 ? 'Today' : format(addDays(startOfToday(), index), 'LLL d');
}

const mapData = (data: any): any[] => {
  // console.log(`WeatherService -> mapData -> data`, data)
  const { current, daily } = data;
  let dailyWeather: any[] = []
  if (daily) {
    dailyWeather = daily.map(({ temp, weather }, index: number) => ({
      weekday: getWeekday(index),
      day: getDayName(index),
      temp: Math.round(temp.day),
      high: Math.round(temp.max),
      low: Math.round(temp.min),
      iconUrl: getIconUrl(weather),
    })).slice(0, MAX_DAYS);
  }
  if (current) {
    const { temp, weather } = current;
    if (temp !== undefined && dailyWeather.length) {
      dailyWeather[0].temp = Math.round(temp);
      dailyWeather[0].iconUrl = getIconUrl(weather);
    }
  }
  return dailyWeather;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService implements OnDestroy {

  constructor(private http: HttpClient) {}

  private hourInterval: any;
  private weatherSubject = new BehaviorSubject<any>([]);

  ngOnDestroy(): void {
    if (this.hourInterval) {
      clearInterval(this.hourInterval);
    }
  }

  getCurrentWeather(): Observable<any> {
    this.updateCurrentWeather();
    this.hourInterval = setInterval(() => {
      this.updateCurrentWeather()
    }, ONE_HOUR);
    return this.weatherSubject;
  }

  updateCurrentWeather(): void {
    this.http.get(OPEN_WEATHER_URL)
      .pipe(
        retry(3),
        map(mapData),
        catchError(handleError)
      )
      .subscribe(
        data => this.weatherSubject.next(data)
      );
  }
}
