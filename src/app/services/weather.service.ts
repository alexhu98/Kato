import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { addDays, format, startOfToday } from 'date-fns';

const OPEN_WEATHER_URL = 'http://api.openweathermap.org/data/2.5/onecall?lat=34.28&lon=-118.88&exclude=minutely,hourly&units=imperial&appid=e6b1a8915b1d79330d9c272f1b2394eb';

const MAX_DAYS = 3;

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
export class WeatherService {

  constructor(private http: HttpClient) {}

  errorHandler(error: HttpErrorResponse) {
    return throwError(error.message || 'Server error');
  }

  getCurrentWeather(): Observable<any> {
    return this.http.get(OPEN_WEATHER_URL)
      .pipe(
        map(mapData),
        catchError(this.errorHandler)
      )
  }
}

/*
{
  "lat": 34.28,
  "lon": -118.88,
  "timezone": "America/Los_Angeles",
  "timezone_offset": -25200,
  "current": {
    "dt": 1601701534,
    "sunrise": 1601646667,
    "sunset": 1601689079,
    "temp": 74.44,
    "feels_like": 70.3,
    "pressure": 1008,
    "humidity": 32,
    "dew_point": 42.69,
    "uvi": 6.48,
    "clouds": 0,
    "visibility": 10000,
    "wind_speed": 4.36,
    "wind_deg": 45,
    "weather": [
      {
        "id": 800,
        "main": "Clear",
        "description": "clear sky",
        "icon": "01n"
      }
    ]
  },
  "daily": [
    {
      "dt": 1601665200,
      "sunrise": 1601646667,
      "sunset": 1601689079,
      "temp": {
        "day": 96.44,
        "min": 72.64,
        "max": 99.97,
        "night": 74.97,
        "eve": 92.91,
        "morn": 72.64
      },
      "feels_like": {
        "day": 92.82,
        "night": 70.34,
        "eve": 87.89,
        "morn": 68.29
      },
      "pressure": 1014,
      "humidity": 12,
      "dew_point": 37.02,
      "wind_speed": 1.05,
      "wind_deg": 197,
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        }
      ],
      "clouds": 0,
      "pop": 0,
      "uvi": 6.48
    },
    {
      "dt": 1601751600,
      "sunrise": 1601733111,
      "sunset": 1601775397,
      "temp": {
        "day": 96.26,
        "min": 70.2,
        "max": 98.11,
        "night": 70.2,
        "eve": 90.63,
        "morn": 70.36
      },
      "feels_like": {
        "day": 91.54,
        "night": 68.52,
        "eve": 84.76,
        "morn": 66.36
      },
      "pressure": 1011,
      "humidity": 10,
      "dew_point": 32.32,
      "wind_speed": 1.74,
      "wind_deg": 214,
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        }
      ],
      "clouds": 0,
      "pop": 0,
      "uvi": 6.22
    },
    {
      "dt": 1601838000,
      "sunrise": 1601819555,
      "sunset": 1601861715,
      "temp": {
        "day": 92.48,
        "min": 67.14,
        "max": 95.5,
        "night": 70.5,
        "eve": 91.53,
        "morn": 68.5
      },
      "feels_like": {
        "day": 86.94,
        "night": 65.8,
        "eve": 84.6,
        "morn": 64.92
      },
      "pressure": 1013,
      "humidity": 14,
      "dew_point": 37.13,
      "wind_speed": 4.7,
      "wind_deg": 187,
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        }
      ],
      "clouds": 0,
      "pop": 0,
      "uvi": 6.3
    },
    {
      "dt": 1601924400,
      "sunrise": 1601906000,
      "sunset": 1601948033,
      "temp": {
        "day": 91.45,
        "min": 66.88,
        "max": 94.46,
        "night": 67.5,
        "eve": 89.65,
        "morn": 66.88
      },
      "feels_like": {
        "day": 85.78,
        "night": 63.63,
        "eve": 81.59,
        "morn": 62.15
      },
      "pressure": 1016,
      "humidity": 11,
      "dew_point": 30.43,
      "wind_speed": 3.11,
      "wind_deg": 177,
      "weather": [
        {
          "id": 804,
          "main": "Clouds",
          "description": "overcast clouds",
          "icon": "04d"
        }
      ],
      "clouds": 98,
      "pop": 0,
      "uvi": 6.17
    },
    {
      "dt": 1602010800,
      "sunrise": 1601992445,
      "sunset": 1602034351,
      "temp": {
        "day": 89.87,
        "min": 66.65,
        "max": 93.63,
        "night": 67.68,
        "eve": 87.26,
        "morn": 66.65
      },
      "feels_like": {
        "day": 83.98,
        "night": 64.06,
        "eve": 79.27,
        "morn": 61.54
      },
      "pressure": 1016,
      "humidity": 13,
      "dew_point": 32.7,
      "wind_speed": 4.23,
      "wind_deg": 206,
      "weather": [
        {
          "id": 802,
          "main": "Clouds",
          "description": "scattered clouds",
          "icon": "03d"
        }
      ],
      "clouds": 37,
      "pop": 0,
      "uvi": 6.26
    },
    {
      "dt": 1602097200,
      "sunrise": 1602078891,
      "sunset": 1602120671,
      "temp": {
        "day": 86.83,
        "min": 64.33,
        "max": 90.39,
        "night": 64.33,
        "eve": 80.28,
        "morn": 66.07
      },
      "feels_like": {
        "day": 82.15,
        "night": 63.14,
        "eve": 73.69,
        "morn": 61.9
      },
      "pressure": 1014,
      "humidity": 18,
      "dew_point": 38.53,
      "wind_speed": 3.78,
      "wind_deg": 217,
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        }
      ],
      "clouds": 9,
      "pop": 0,
      "uvi": 6.13
    },
    {
      "dt": 1602183600,
      "sunrise": 1602165337,
      "sunset": 1602206991,
      "temp": {
        "day": 84.51,
        "min": 62.82,
        "max": 87.46,
        "night": 65.14,
        "eve": 81.43,
        "morn": 62.82
      },
      "feels_like": {
        "day": 80.04,
        "night": 61.72,
        "eve": 74.62,
        "morn": 61.72
      },
      "pressure": 1015,
      "humidity": 23,
      "dew_point": 43.29,
      "wind_speed": 4.92,
      "wind_deg": 218,
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        }
      ],
      "clouds": 0,
      "pop": 0,
      "uvi": 6.27
    },
    {
      "dt": 1602270000,
      "sunrise": 1602251783,
      "sunset": 1602293311,
      "temp": {
        "day": 84.31,
        "min": 62.2,
        "max": 86.63,
        "night": 62.2,
        "eve": 83.41,
        "morn": 63.45
      },
      "feels_like": {
        "day": 80.1,
        "night": 61.41,
        "eve": 77.32,
        "morn": 60.12
      },
      "pressure": 1012,
      "humidity": 23,
      "dew_point": 42.67,
      "wind_speed": 4.41,
      "wind_deg": 176,
      "weather": [
        {
          "id": 801,
          "main": "Clouds",
          "description": "few clouds",
          "icon": "02d"
        }
      ],
      "clouds": 22,
      "pop": 0,
      "uvi": 6.24
    }
  ]
}
*/
