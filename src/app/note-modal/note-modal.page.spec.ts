import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NoteModalPage } from './note-modal.page';

describe('NoteModalPage', () => {
  let component: NoteModalPage;
  let fixture: ComponentFixture<NoteModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoteModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NoteModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
