import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GestureController, IonContent, NavController } from '@ionic/angular'
import { AuthenticationService } from '../services/authentication.service'
import { CalendarService } from '../services/calendar.service'
import { WeatherService } from '../services/weather.service'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page implements AfterViewInit {

  today$ = this.calendarService.today$;

  @ViewChild('content') content: ElementRef;

  private panStartX: 0;
  private panStartY: 0;
  private panEndX: 0;
  private panEndY: 0;
  private panVelocityX: 0.0;
  private panVelocityY: 0.0;

  constructor(
    private navController: NavController,
    private gestureController: GestureController,
    private authService: AuthenticationService,
    private calendarService: CalendarService,
    private weatherService: WeatherService,
  ) {}

  ngAfterViewInit(): void {
    console.log(`Tab1Page -> ngAfterViewInit -> this.content`, this.content)
    if (this.content) {
      const gesture = this.gestureController.create({
        gestureName: 'swipe-tab',
        gesturePriority: 100,
        el: this.content.nativeElement,
        direction: 'x',
        onStart: (ev) => this.onStart(ev),
        onEnd: (ev) => this.onEnd(ev),
      })
      // gesture.enable()
    }
  }

  private onStart(ev) {
    console.log(`Tab1Page -> onStart -> ev`, ev)
    this.panStartX = ev.currentX;
    this.panStartY = ev.currentY;
  }

  private onEnd(ev) {
    console.log(`Tab1Page -> onEnd -> ev`, ev)
    if (ev.type === 'pan') {
      this.panEndX = ev.currentX;
      this.panEndY = ev.currentY;
      this.panVelocityX = ev.velocityX;
      this.panVelocityY = ev.velocityY;
      this.handlePan();
    }
  }

  private handlePan() {
    console.log(`Tab1Page -> executePanGesture -> vX = ${this.panVelocityX}, eY = ${this.panVelocityY}`);
    console.log(`Tab1Page -> executePanGesture -> sX = ${this.panStartX}, sY = ${this.panStartY}, eX = ${this.panEndX}, eY = ${this.panEndY}`);
    if (Math.abs(this.panVelocityX) > Math.abs(this.panVelocityY) * 5 && Math.abs(this.panVelocityX) > 0.20) {
      const diff = this.panStartX - this.panEndX;
      if (diff > 0) {
        this.swipeLeft();
      }
      else {
        this.swipeRight();
      }
    }
  }

  doRefresh(event) {
    this.calendarService.refresh();
    this.weatherService.refresh();
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

  swipeLeft() {
    console.log(`Tab1Page -> swipeLeft`)
    this.navController.navigateForward('/tabs/tab2')
  }

  swipeRight() {
    console.log(`Tab1Page -> swipeRight`)
    this.navController.navigateForward('/tabs/tab2')
  }
}
