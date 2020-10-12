import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../services/device.service'

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
})
export class DeviceComponent {

  devices$ = this.deviceService.devices$;

  constructor(
    private deviceService: DeviceService,
  ) {}

  toggleDevice(device) {
    this.deviceService.toggleDevice(device.alias);
  }
}
