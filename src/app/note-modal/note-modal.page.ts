import { Component, Input, OnDestroy } from '@angular/core';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { isPlatform, ModalController } from '@ionic/angular';
import { NoteService } from '../services/note.service';

@Component({
  selector: 'app-note-modal',
  templateUrl: './note-modal.page.html',
  styleUrls: ['./note-modal.page.scss'],
})
export class NoteModalPage implements OnDestroy {
  @Input() id: string;
  @Input() content: string;

  constructor(
    private modalController: ModalController,
    private noteService: NoteService,
    private tts: TextToSpeech,
  ) { }

  ngOnDestroy() {
    if (this.isAndroid()) {
      this.tts.speak('');
    }
  }

  async cancel(): Promise<void> {
    this.modalController.dismiss();
  }

  async save(): Promise<void> {
    if (this.id || this.content) { // don't save a new empty note
      await this.noteService.update(this.id, this.content)
    }
    this.modalController.dismiss();
  }

  speak(): void {
    if (this.isAndroid()) {
      this.tts.speak(this.content).then();
    }
  }

  isAndroid(): boolean {
    return isPlatform('capacitor');
  }
}
