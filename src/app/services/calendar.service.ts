import * as R from 'ramda';
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { addWeeks, differenceInDays, format, formatISO, isToday, parseISO, startOfToday, subDays } from 'date-fns'
import { GoogleApiService } from 'ng-gapi'
import { SubSink } from 'subsink'
import { AuthenticationService } from './authentication.service'

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
  return (isToday(date) ? 'Today' : format(date, 'LLL d')) + format(date, ' EEE');
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

  refreshTimer$ = timer(0, ONE_HOUR);
  refresh$ = new BehaviorSubject<any>(null);
  events$ = new BehaviorSubject<any>([]);

  today$ = timer(0, TEN_SECOND).pipe(
    map(() => formatToday()),
    distinctUntilChanged(),
  );

  private subs = new SubSink();
  private calendarApi: any;

  constructor(
    private ngZone: NgZone,
    private gapiService: GoogleApiService,
    private authenticationService: AuthenticationService,
  ) {
    this.subs.add(this.refreshTimer$.subscribe(this.refresh$));
    this.subs.add(this.refresh$.subscribe(async () => await this.queryAll()));
    this.subs.add(this.authenticationService.user$.subscribe(() => this.refresh()));
    this.subs.add(this.gapiService.onLoad().subscribe(() => this.loadGapiClient()));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadGapiClient() {
    gapi.load('client', async () => {
      // console.log(`CalendarService -> loadGapiClient -> gapi.client`, gapi.client)
      await gapi.client.load('calendar', 'v3');
      this.calendarApi = (gapi.client as any).calendar;
      // console.log(`CalendarService -> loadGapiClient -> this.calendarApi`, this.calendarApi)
      this.refresh();
    });
  }

  refresh(): void {
    this.refresh$.next(null);
  }

  async queryAll() {
    const accessToken = await this.authenticationService.getAccessToken();
    // console.log(`CalendarService -> fetchEvents -> accessToken`, accessToken)
    // console.log(`CalendarService -> fetchEvents -> this.calendarApi`, this.calendarApi)
    if (accessToken && this.calendarApi) {
      gapi.client.setToken({
        access_token: accessToken,
      });
      const eventStartTime = formatISO(startOfToday())
      const eventEndTime = formatISO(addWeeks(startOfToday(), 2))
      const request = this.calendarApi.events.list({
        calendarId: 'primary',
        singleEvents: true,
        timeMin: eventStartTime,
        timeMax: eventEndTime,
        orderBy: 'startTime',
      });
      request.execute(response => {
        if (!response.error) {
          const events = R.map((item: any) => ({
            id: item.id,
            summary: item.summary,
            start: item.start.date || item.start.dateTime,
            end: item.end.date || item.end.dateTime,
          }), R.defaultTo([], response.items))
          const mappedEvents = mapEvents(events)
          this.ngZone.run(() => {
            this.events$.next(mappedEvents)
          });
        }
        else {
          console.error(`CalendarService -> fetchEvents -> error -> response`, response);
        }
      });
    }
    else {
      this.ngZone.run(() => {
        this.events$.next([])
      });
    }
  }
}
