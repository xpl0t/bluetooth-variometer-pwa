import { Injectable } from '@angular/core';
import { GATT_SVC_BATTERY, GATT_SVC_HM10, StodeusAdapter } from '@app-shared/device-adapters';
import { Device, DeviceId } from '@app-shared/models';
import { BehaviorSubject, Observable, defer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BluetoothConnectionService {

  public readonly connected = new BehaviorSubject(false);

  public readonly currentDeviceMeta = new BehaviorSubject<Device>(null);

  public readonly batteryStatus = new BehaviorSubject<number>(null);
  public readonly preasure = new BehaviorSubject<number>(null);
  public readonly altitude = new BehaviorSubject<number>(null);
  public readonly vario = new BehaviorSubject<number>(null);
  public readonly temperature = new BehaviorSubject<number>(null);

  private readonly adapterMap = new Map<DeviceId, Device>([
    [
      'stodeus',
      {
        adapter: new StodeusAdapter(),
        gattServices: [ GATT_SVC_BATTERY, GATT_SVC_HM10 ],
        features: {
          battery: true,
          altitude: true,
          preasure: true,
          vario: true,
          temperature: true
        }
      }
    ]
  ]);

  public connect(deviceId: DeviceId): Observable<void> {
    const deviceMeta = this.adapterMap.get(deviceId);
    if (deviceMeta == null) {
      throw new Error('Invalid device id');
    }

    return defer(async () => {
      const dev = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        // filters: [{ services: ['battery_service'] }],
        optionalServices: deviceMeta.gattServices
      });
    
      await dev.gatt.connect();
      await deviceMeta.adapter.register(this, dev);

      this.connected.next(true);
    
      dev.ongattserverdisconnected = async () => {
        console.warn('Gatt server disconnected');
        delete dev.ongattserverdisconnected; // Remove event listener

        // await deviceMeta.adapter.deregister(this, dev);
        // await dev.forget();

        // Reset values
        this.connected.next(false);
        this.currentDeviceMeta.next(null);
        this.batteryStatus.next(null);
        this.preasure.next(null);
        this.altitude.next(null);
        this.vario.next(null);
      };


    });
  }

}
