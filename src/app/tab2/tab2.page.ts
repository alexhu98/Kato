import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router'
import { CalendarService } from '../services/calendar.service'
import { GestureController, ViewDidEnter, ViewWillLeave } from '@ionic/angular'
import { SwipeTabPage } from '../swipe-tab/swipe-tab.page'
import { DeviceService } from '../services/device.service'

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page extends SwipeTabPage implements ViewDidEnter, ViewWillLeave {

  today$ = this.calendarService.today$;

  constructor(
    router: Router,
    zone: NgZone,
    gestureController: GestureController,
    protected calendarService: CalendarService,
    protected deviceService: DeviceService,
  ) {
    super(router, zone, gestureController, '/tabs/tab3', '/tabs/tab1');
  }

  refresh(event) {
    console.log(`Tab2Page -> refresh -> event`, event)
    this.calendarService.refresh();
    this.deviceService.refresh();
    event.target.complete();
  }

  ionViewDidEnter() {
    this.deviceService.startTimer();
  }

  ionViewWillLeave() {
    this.deviceService.stopTimer();
  }
}
