import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router'
import { GestureController } from '@ionic/angular'
import { AuthenticationService } from '../services/authentication.service'
import { CalendarService } from '../services/calendar.service'
import { WeatherService } from '../services/weather.service'
import { SwipeTabPage } from '../swipe-tab/swipe-tab.page'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page extends SwipeTabPage {

  today$ = this.calendarService.today$;

  constructor(
    router: Router,
    zone: NgZone,
    gestureController: GestureController,
    private authService: AuthenticationService,
    private calendarService: CalendarService,
    private weatherService: WeatherService,
  ) {
    super(router, zone, gestureController, '/tabs/tab2', '/tabs/tab2');
  }

  refresh(event) {
    this.calendarService.refresh();
    this.weatherService.refresh();
    event.target.complete();
  }

  isAuthReady() {
    return this.authService.isReady();
  }

  getProfileImage() {
    return this.authService.getProfileImage();
  }

  async signIn() {
    await this.authService.signIn();
  }

  async signOut() {
    await this.authService.signOut();
  }
}
