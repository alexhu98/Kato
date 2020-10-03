import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { WeatherComponent } from './weather.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [WeatherComponent],
  exports: [WeatherComponent]
})
export class WeatherComponentModule {}
