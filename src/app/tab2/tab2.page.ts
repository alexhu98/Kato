import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router'
import { CalendarService } from '../services/calendar.service'
import { GestureController, NavController } from '@ionic/angular'
import { SwipeableTabComponent } from '../swipeable-tab/swipeable-tab.component'

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page extends SwipeableTabComponent implements AfterViewInit {

  @ViewChild('tabContent') tabContent: ElementRef;

  today$ = this.calendarService.today$;

  constructor(
    private router: Router,
    private zone: NgZone,
    private gestureController: GestureController,
    private calendarService: CalendarService,
  ) {
    super();
  }

  ngAfterViewInit() {
    this.initializeSwipeableTab(this.gestureController, this.tabContent);
  }

  protected onSwipeLeft(): void {
    this.zone.run(async () => {
      await this.router.navigate(['/tabs/tab1']);
    });
  }

  protected onSwipeRight(): void {
    this.zone.run(async () => {
      await this.router.navigate(['/tabs/tab1']);
    });
  }
}
