import { Injectable, NgZone, OnDestroy, Query } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore'
import * as firebase from 'firebase'
import { AuthenticationService } from './authentication.service'
import { BehaviorSubject } from 'rxjs'
import { SubSink } from 'subsink'

interface Note {
  id: string;
  content: string;
  updatedAt: firebase.firestore.Timestamp;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService implements OnDestroy {

  refresh$ = new BehaviorSubject<any>(null);
  notes$ = new BehaviorSubject<Note[]>([]);

  private subs = new SubSink();

  constructor(
    private ngZone: NgZone,
    private db: AngularFirestore,
    private authenticationService: AuthenticationService
  ) {
    this.subs.add(this.refresh$.subscribe(async () => await this.queryAll()));
    this.subs.add(this.authenticationService.user$.subscribe(() => this.refresh()));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  refresh(): void {
    this.refresh$.next(null);
  }

  async queryAll() {
    const userData = this.authenticationService.user$.getValue();
    if (userData.signedIn && userData.userId) {
      this.db.collection('notes').ref.where('userId', '==', userData.userId).orderBy('updatedAt', 'desc').get().then(docs => {
        const notes = []
        docs.forEach(doc => {
          notes.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        this.emit(notes);
      });
    }
  }

  async update(id: string, content: string): Promise<void> {
    const now = firebase.firestore.Timestamp.fromDate(new Date());
    if (id) {
      await this.db.collection('notes').doc(id).update({
        content,
        updatedAt: now,
      });
    }
    else {
      const userData = this.authenticationService.user$.getValue();
      if (userData.signedIn && userData.userId) {
        await this.db.collection('notes').add({
          userId: userData.userId,
          content,
          updatedAt: now,
        });
      };
    }
    this.refresh();
  }

  async remove(id: string): Promise<void> {
    await this.db.collection('notes').doc(id).delete();
    this.refresh();
  }

  emit(notes: Note[]): void {
    this.ngZone.run(() => {
      this.notes$.next(notes);
    });
  }
}
