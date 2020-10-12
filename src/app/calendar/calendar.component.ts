import { Component } from '@angular/core';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {

  events$ = this.calendarService.events$;

  constructor(
    private calendarService: CalendarService,
  ) {}
}
