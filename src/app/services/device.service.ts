import * as R from 'ramda';
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { login } from 'tplink-cloud-api';

// https://www.npmjs.com/package/tplink-cloud-api
// https://www.youtube.com/watch?v=B-nFj2o03i8

const TPLINK_USER = environment.tplinkConfig.user;
const TPLINK_PASSWORD = environment.tplinkConfig.password;
const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;

const FILTER_DEVICE_NAMES = ['Fan', 'Light'];

const getIconName = (name): string => {
  let iconName = 'bulb-outline';
  if (name.includes('Fan')) {
    iconName = 'snow-outline';
  }
  return iconName;
}

const getStateIcon = (state: number): string => {
  return state ? 'power-outline' : 'remove-circle-outline';
}

const toggleState = (device: any): void => {
  device.state = device.state ? 0 : 1;
  device.stateIcon = getStateIcon(device.state);
}

const mapDevice = (device: any, stateMap: any): any => ({
  icon: getIconName(device.alias),
  alias: device.alias,
  state: stateMap[device.alias],
  stateIcon: getStateIcon(stateMap[device.alias]),
})

@Injectable({
  providedIn: 'root',
})
export class DeviceService implements OnDestroy {

  public devices$ = new BehaviorSubject<any>([]);

  private minuteInterval: any;
  private tplink: any;

  constructor(private http: HttpClient) {
    this.updateDevices().then();
    this.minuteInterval = setInterval(() => {
      this.updateDevices().then();
    }, ONE_MINUTE);
  }

  ngOnDestroy(): void {
    if (this.minuteInterval) {
      clearInterval(this.minuteInterval);
    }
  }

  async connect() {
    if (!this.tplink) {
      this.tplink = await login(TPLINK_USER, TPLINK_PASSWORD);
    }
  }

  async updateDevices() {
    await this.connect();
    if (this.tplink) {
      const deviceList = await this.tplink.getDeviceList();
      if (deviceList) {
        // retrieve the device state in advance and store them in a state map
        const stateMap = {};
        for (const device of deviceList) {
          stateMap[device.alias] = await this.tplink.getHS100(device.alias).getRelayState();
        }
        const devices = R.pipe(
          R.map(device => mapDevice(device, stateMap)),
          R.filter((device: any) => R.includes(device.alias, FILTER_DEVICE_NAMES)),
          R.sortBy(R.prop('alias'))
        )(deviceList);
        this.devices$.next(devices);
      }
    }
  }

  async toggleDevice(alias: string) {
    await this.connect();
    if (this.tplink) {
      await this.tplink.getHS100(alias).toggle();
      const devices = this.devices$.getValue();
      const device = R.find(R.propEq('alias', alias), devices) as any;
      if (device) {
        // optimistic update on the state icon for quick user feedback
        toggleState(device);
        this.devices$.next(devices);
      }
      // then perform a refresh to get the actual device state
      await this.updateDevices();
    }
  }
}
