import { Component } from '@angular/core';
import { CalendarService } from '../services/calendar.service'

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  today$ = this.calendarService.today$;

  constructor(
    private calendarService: CalendarService,
  ) {}
}
