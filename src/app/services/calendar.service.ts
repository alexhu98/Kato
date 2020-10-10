import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { differenceInDays, format, formatISO, isToday, parseISO, startOfToday, subDays } from 'date-fns'
import { handleError } from './error.handler'

// const CLIENT_ID = '872194152518-m9dmuf0i9heef3au1ld811shsn9bp0k8.apps.googleusercontent.com';
// const CLIENT_SECRET = '5mc_f_24had5LNIxT1m-CrZz';
// const REFRESH_TOKEN = '1//04jXCPLyX8sDLCgYIARAAGAQSNwF-L9Ir2rAfY_yjqBFNPN4LH4Pa3flJVI2s3MhfaxawIPUiwUPXKGSKlASMhvR8HVadLmzRrFA';

const CALENDAR_URL = 'http://192.168.0.78:8003/api/calendar/events';
const ONE_SECOND = 1000;
const TEN_SECOND = 10 * 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;

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
  const date = parseISO(isoDateTime);
  return isToday(date) ? 'Today' : format(date, 'LLL d');
}

const getTime = (isoDateTime: string): string => {
  return isoDateTime.includes('T') ? format(parseISO(isoDateTime), 'p').toLocaleLowerCase() : '';
}

const getEndDay = (start: string, end: string): string => {
  if (getTime(start)) {
    return '';
  }
  else {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const diff = differenceInDays(endDate, startDate);
    if (diff > 1) {
      return '- ' + getDayName(formatISO(subDays(endDate, 1)));
    }
  }
  return '';
}

const mapEvent = (event: any) => ({
  ...event,
  iconName: getIconName(event.summary),
  day: getDayName(event.start),
  time: getTime(event.start),
  endDay: getEndDay(event.start, event.end),
})

const mapEvents = (events: any) => {
  return events.map(mapEvent)
}

const formatToday = (): string => {
  const date = new Date();
  return format(date, 'LLL d EEE') + ' ' + format(date, 'p').toLocaleLowerCase();
}

@Injectable({
  providedIn: 'root',
})
export class CalendarService implements OnDestroy {
  constructor(private http: HttpClient) {}

  private hourInterval: any;
  private eventsSubject = new BehaviorSubject<any>([]);

  ngOnDestroy(): void {
    if (this.hourInterval) {
      clearInterval(this.hourInterval);
    }
  }

  getToday(): Observable<string> {
    return timer(0, TEN_SECOND).pipe(
      map(() => formatToday()),
      distinctUntilChanged(),
    );
  }

  getEvents(): Observable<any> {
    this.updateEvents();
    this.hourInterval = setInterval(() => {
      this.updateEvents()
    }, ONE_HOUR);
    return this.eventsSubject;
  }

  updateEvents() {
    this.http.get(CALENDAR_URL).pipe(
      map(mapEvents),
      catchError(handleError)
    ).subscribe(
      data => this.eventsSubject.next(data)
    );
  }
}
