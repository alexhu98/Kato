import { Component, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router'
import { GestureController } from '@ionic/angular'
import { SubSink } from 'subsink'
import { AuthenticationService } from '../services/authentication.service'
import { CalendarService } from '../services/calendar.service'
import { WeatherService } from '../services/weather.service'
import { SwipeTabPage } from '../swipe-tab/swipe-tab.page'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})

export class Tab1Page extends SwipeTabPage implements OnDestroy {

  user$ = this.authService.user$;
  today$ = this.calendarService.today$;
  private subs = new SubSink()

  constructor(
    router: Router,
    zone: NgZone,
    gestureController: GestureController,
    private authService: AuthenticationService,
    private calendarService: CalendarService,
    private weatherService: WeatherService,
  ) {
    super(router, zone, gestureController, '/tabs/tab2', '/tabs/tab3');
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  refresh(event) {
    this.calendarService.refresh();
    this.weatherService.refresh();
    event.target.complete();
  }

  async signIn() {
    await this.authService.signIn();
  }

  async signOut() {
    await this.authService.signOut();
  }
}
