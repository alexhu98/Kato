import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { CalendarService } from '../services/calendar.service';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {

  constructor(private calendarService: CalendarService, private toastController: ToastController) {}

  public events = [];

  ngOnInit() {
    this.calendarService.getEvents().subscribe(
      data => this.events = data,
      async (error) => {
        console.log(`CalendarComponent -> ngOnInit -> error`, error)
        const toast = await this.toastController.create({
          message: error,
          duration: 3000,
        });
        toast.present();
      }
    );
  }
}
