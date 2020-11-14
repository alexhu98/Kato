import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router'
import { CalendarService } from '../services/calendar.service'
import { GestureController, ModalController, ViewDidEnter, ViewWillLeave } from '@ionic/angular'
import { SwipeTabPage } from '../swipe-tab/swipe-tab.page'
import { NoteService } from '../services/note.service'
import { NoteModalPage } from '../note-modal/note-modal.page'

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page extends SwipeTabPage {

  today$ = this.calendarService.today$;

  constructor(
    router: Router,
    zone: NgZone,
    gestureController: GestureController,
    protected calendarService: CalendarService,
    private noteService: NoteService,
    private modalController: ModalController,
  ) {
    super(router, zone, gestureController, '/tabs/tab1', '/tabs/tab2');
  }

  async addNote() {
    const note = { id: '', content: '' };
    const modal = await this.modalController.create({
      component: NoteModalPage,
      componentProps: note,
    });
    modal.present();
  }

  refresh(event) {
    this.noteService.refresh();
    event.target.complete();
  }
}
