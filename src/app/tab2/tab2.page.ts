import { Component } from '@angular/core';
import { CalendarService } from '../services/calendar.service'

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  today$ = this.calendarService.today$;

  constructor(
    private calendarService: CalendarService,
  ) {}
}
