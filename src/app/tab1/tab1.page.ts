import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service'
import { SubSink } from 'subsink'
import { CalendarService } from '../services/calendar.service'
import { WeatherService } from '../services/weather.service'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page implements OnInit, OnDestroy {

  constructor(
    private authService: AuthenticationService,
    private calendarService: CalendarService,
    private weatherService: WeatherService,
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

  doRefresh(event) {
    this.calendarService.updateEvents();
    this.weatherService.updateCurrentWeather();
    event.target.complete();
  }

  isAuthReady() {
    return this.authService.isReady()
  }

  getProfileImage() {
    return this.authService.getProfileImage()
  }

  login() {
    this.authService.googleAuth()
  }

  logout() {
    this.authService.signOut()
  }
}
