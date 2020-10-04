import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { WeatherComponentModule } from '../weather/weather.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { CalendarComponentModule } from '../calendar/calendar.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    WeatherComponentModule,
    CalendarComponentModule,
    Tab1PageRoutingModule
  ],
  declarations: [Tab1Page]
})
export class Tab1PageModule {}
