import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { DeviceComponent } from './device.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [DeviceComponent],
  exports: [DeviceComponent]
})
export class DeviceModule { }
