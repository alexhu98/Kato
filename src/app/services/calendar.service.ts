import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer } from 'rxjs';
import { catchError, distinctUntilChanged, exhaustMap, map } from 'rxjs/operators';
import { differenceInDays, format, formatISO, isToday, parseISO, subDays } from 'date-fns'
import { SubSink } from 'subsink'
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

  refresh$ = new BehaviorSubject<any>(null);
  refreshTimer$ = timer(0, ONE_MINUTE);

  updateEvents$ = this.http.get(CALENDAR_URL).pipe(
    map(mapEvents),
    catchError(handleError)
  )

  events$ = this.refresh$.pipe(
    exhaustMap(() => this.updateEvents$),
  )

  today$ = timer(0, TEN_SECOND).pipe(
    map(() => formatToday()),
    distinctUntilChanged(),
  );

  private subs = new SubSink();

  constructor(private http: HttpClient) {
    this.subs.add(this.refreshTimer$.subscribe(this.refresh$));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  refresh(): void {
    this.refresh$.next(null);
  }
}
