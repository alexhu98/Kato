import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router'
import { GestureController, NavController } from '@ionic/angular'
import { AuthenticationService } from '../services/authentication.service'
import { CalendarService } from '../services/calendar.service'
import { WeatherService } from '../services/weather.service'
import { SwipeableTabComponent } from '../swipeable-tab/swipeable-tab.component'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page extends SwipeableTabComponent implements AfterViewInit {

  today$ = this.calendarService.today$;

  @ViewChild('tabContent') tabContent: ElementRef;

  constructor(
    private router: Router,
    private zone: NgZone,
    private gestureController: GestureController,
    private authService: AuthenticationService,
    private calendarService: CalendarService,
    private weatherService: WeatherService,
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.initializeSwipeableTab(this.gestureController, this.tabContent);
  }

  protected onSwipeLeft(): void {
    this.zone.run(async () => {
      await this.router.navigate(['/tabs/tab2']);
    });
  }

  protected onSwipeRight(): void {
    this.zone.run(async () => {
      await this.router.navigate(['/tabs/tab2']);
    });
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

  login() {
    this.authService.googleAuth();
  }

  logout() {
    this.authService.signOut();
  }
}
