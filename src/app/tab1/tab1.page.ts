import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service'
import { CalendarService } from '../services/calendar.service'
import { WeatherService } from '../services/weather.service'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page implements OnInit {

  constructor(
    private authService: AuthenticationService,
    private calendarService: CalendarService,
    private weatherService: WeatherService,
  ){}

  public today = ''

  ngOnInit() {
    this.calendarService.getToday().subscribe(
      data => this.today = data,
    );
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
