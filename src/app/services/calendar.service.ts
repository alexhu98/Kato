import * as R from 'ramda';
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { addWeeks, differenceInDays, format, formatISO, isToday, parseISO, startOfToday, subDays } from 'date-fns'
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

  refreshTimer$ = timer(0, ONE_MINUTE);
  refresh$ = new BehaviorSubject<any>(null);
  events$ = new BehaviorSubject<any>([]);

  today$ = timer(0, TEN_SECOND).pipe(
    map(() => formatToday()),
    distinctUntilChanged(),
  );

  private subs = new SubSink();

  constructor(
    private ngZone: NgZone,
    private authenticationService: AuthenticationService,
  ) {
    this.subs.add(this.refreshTimer$.subscribe(this.refresh$));
    this.subs.add(this.refresh$.subscribe(() => this.fetchEvents()));
    this.subs.add(this.authenticationService.user$.subscribe(({ signedIn }) => signedIn && this.refresh()));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  refresh(): void {
    this.refresh$.next(null);
  }

  fetchEvents() {
    const accessToken = this.authenticationService.getAccessToken();
    if (gapi && gapi.client && accessToken) {
      gapi.client.setToken({
        access_token: accessToken,
      });
      const calendar = (gapi.client as any).calendar;
      console.log(`CalendarService -> fetchEvents -> gapi.client.calendar`, calendar)
      if (calendar) {
        const eventStartTime = formatISO(startOfToday())
        const eventEndTime = formatISO(addWeeks(startOfToday(), 2))
        const request = calendar.events.list({
          calendarId: 'primary',
          singleEvents: true,
          timeMin: eventStartTime,
          timeMax: eventEndTime,
          orderBy: 'startTime',
        });
        request.execute(response => {
          if (!response.error) {
            console.log(`CalendarService -> fetchEvents -> response.items`, response.items)
            const events = R.map((item: any) => ({
              id: item.id,
              summary: item.summary,
              start: item.start.date || item.start.dateTime,
              end: item.end.date || item.end.dateTime,
            }), R.defaultTo([], response.items))
            console.log(`CalendarService -> fetchEvents -> events`, events)
            const mappedEvents = mapEvents(events)
            console.log(`CalendarService -> fetchEvents -> mappedEvents`, mappedEvents)
            this.ngZone.run(() => {
              this.events$.next(mappedEvents)
            });
          }
          else {
            console.log(`CalendarService -> fetchEvents -> error -> response`, response);
          }
        });
      }
    }
  }
}
