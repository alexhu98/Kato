import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CalendarComponent } from './calendar.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,

  ],
  declarations: [CalendarComponent],
  exports: [CalendarComponent]
})
export class CalendarModule {}
