import { Component, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular'
import { NoteService } from '../services/note.service'

@Component({
  selector: 'app-note-modal',
  templateUrl: './note-modal.page.html',
  styleUrls: ['./note-modal.page.scss'],
})
export class NoteModalPage {
  @Input() id: string;
  @Input() content: string;

  constructor(
    private modalController: ModalController,
    private noteService: NoteService,
  ) { }

  cancel(): void {
    this.modalController.dismiss({ dismissed: true });
  }

  async save() {
    if (this.content) {
      await this.noteService.update(this.id, this.content)
    }
    this.modalController.dismiss({ dismissed: true });
  }
}
