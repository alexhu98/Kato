import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink'
import { CalendarService } from '../services/calendar.service'
import { DeviceService } from '../services/device.service'

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {

  constructor(
    private calendarService: CalendarService,
    private deviceService: DeviceService,
  ) {}

  public today = ''
  private subs = new SubSink();

  ngOnInit() {
    this.subs.add(this.calendarService.getToday().subscribe(
      data => this.today = data,
    ));
  }

  ngOnDestroy() {
    this.subs.unsubscribe()
  }

}
