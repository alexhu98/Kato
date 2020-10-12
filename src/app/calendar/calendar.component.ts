import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { SubSink } from 'subsink'
import { CalendarService } from '../services/calendar.service';
import { showToastOnError } from '../services/error.handler';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnDestroy {

  private subs = new SubSink();

  constructor(
    private calendarService: CalendarService,
    private toastController: ToastController,
  ) {}

  public events = [];

  ngOnInit() {
    this.subs.add(this.calendarService.getEvents().subscribe(
      data => this.events = data,
      error => showToastOnError(this.toastController, error),
    ));
  }

  ngOnDestroy() {
    this.subs.unsubscribe()
  }
}
