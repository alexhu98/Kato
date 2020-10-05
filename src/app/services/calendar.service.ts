import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { format, parseISO } from 'date-fns'

// const CLIENT_ID = '872194152518-m9dmuf0i9heef3au1ld811shsn9bp0k8.apps.googleusercontent.com';
// const CLIENT_SECRET = '5mc_f_24had5LNIxT1m-CrZz';
// const REFRESH_TOKEN = '1//04jXCPLyX8sDLCgYIARAAGAQSNwF-L9Ir2rAfY_yjqBFNPN4LH4Pa3flJVI2s3MhfaxawIPUiwUPXKGSKlASMhvR8HVadLmzRrFA';

const CALENDAR_URL = 'http://192.168.0.78:8003/api/calendar/events';

const getIconName = (summary): string => {
  let iconName = '';
  if (summary.includes('Pay Day')) {
    iconName = 'cash-outline';
  }
  if (summary.includes('Vacation')) {
    iconName = 'rocket-outline';
  }
  return iconName;
}


const getDayName = (isoDateTime: string): string => {
  return format(parseISO(isoDateTime), 'LLL d');
}

const getTime = (isoDateTime: string): string => {
  return isoDateTime.includes('T') ? format(parseISO(isoDateTime), 'p').toLocaleLowerCase() : '';
}


@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(private http: HttpClient) {}

  errorHandler(error: HttpErrorResponse) {
    return throwError(error.message || 'Server error');
  }

  getEvents(): Observable<any> {
    return this.http.get(CALENDAR_URL)
      .pipe(
        map((events: any) => {
          return events.map((event: any) => ({
            ...event,
            iconName: getIconName(event.summary),
            day: getDayName(event.start),
            time: getTime(event.start),
          }))
        }),
        catchError(this.errorHandler)
      );
  }
}
