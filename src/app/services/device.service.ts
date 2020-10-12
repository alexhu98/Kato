import * as R from 'ramda';
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { login } from 'tplink-cloud-api';
import { exhaustMap } from 'rxjs/operators'
import { SubSink } from 'subsink'

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

  refresh$ = new BehaviorSubject<any>(null);
  refreshTimer$ = timer(0, ONE_MINUTE);

  devices$ = this.refresh$.pipe(
    exhaustMap(() => from(this.updateDevices())),
  )

  private subs = new SubSink();
  private tplink: any;

  constructor(private http: HttpClient) {
    this.subs.add(this.refreshTimer$.subscribe(this.refresh$));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe()
  }

  refresh(): void {
    this.refresh$.next(null);
  }

  async connect()  {
    if (!this.tplink) {
      console.log(`DeviceService -> connect`);
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
        return devices;
      }
    }
    return [];
  }

  async toggleDevice(alias: string) {
    await this.connect();
    if (this.tplink) {
      await this.tplink.getHS100(alias).toggle();
      this.refresh();
    }
  }
}
