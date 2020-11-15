import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular'
import { NoteModalPage } from '../note-modal/note-modal.page'
import { NoteService } from '../services/note.service'

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent {

  notes$ = this.noteService.notes$;

  constructor(
    private modalController: ModalController,
    private noteService: NoteService,
  ) {}

  firstLine(content: string): string {
    return content.trim().split('\n')[0];
  }

  async editNote(id: string, content: string): Promise<void> {
    const note = { id, content };
    const modal = await this.modalController.create({
      component: NoteModalPage,
      componentProps: note,
    });
    modal.present();
  }

  async deleteNote(id: string): Promise<void> {
    await this.noteService.delete(id);
  }
}
