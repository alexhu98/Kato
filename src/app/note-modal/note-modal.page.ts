import { Component, Input } from '@angular/core';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { isPlatform, ModalController } from '@ionic/angular';
import { NoteService } from '../services/note.service';

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
    private tts: TextToSpeech,
  ) { }

  async cancel(): Promise<void> {
    if (this.isAndroid()) {
      await this.tts.speak('');
    }
    this.modalController.dismiss({ dismissed: true });
  }

  async save(): Promise<void> {
    if (this.content) {
      await this.noteService.update(this.id, this.content)
    }
    if (this.isAndroid()) {
      await this.tts.speak('');
    }
    this.modalController.dismiss({ dismissed: true });
  }

  speak(): void {
    if (this.isAndroid()) {
      this.tts.speak(this.content);
    }
  }

  isAndroid(): boolean {
    return isPlatform('capacitor');
  }
}
