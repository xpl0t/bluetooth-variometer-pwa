import { Observable, defer } from "rxjs";
import { DeviceAdapter } from "../device-adapter.iface";
import { VarioData } from "@app-shared/models";
import { GATT_CHARACTERISTIC_BATTERY_LEVEL, GATT_CHARACTERISTIC_RX_TX, GATT_SVC_BATTERY, GATT_SVC_HM10 } from "../gatt.const";
import { BluetoothConnectionService } from "@app-shared/bluetooth-connection";

interface Lxwp0Data {
  loggerStored: boolean;
  airSpeed?: number;
  altitude: number;
  vario: number[];
}

interface Lk8ex1Data {
  preassure: number; // Preassure in hPa
  altitude: number; // Altitude in meters, relative to 1013.25
  vario: number; // Vario in cm/s
  temperature: number; // Temperature in C
  batteryPercentage: number; // Battery percentage
}

export class StodeusAdapter implements DeviceAdapter {

  private readonly textDecoder = new TextDecoder();

  private rxTxCharacteristic: BluetoothRemoteGATTCharacteristic;

  public async register(btSv: BluetoothConnectionService, dev: BluetoothDevice): Promise<void> {
    const hm10Sv = await dev.gatt.getPrimaryService(GATT_SVC_HM10);
    const rxtxCh = await hm10Sv.getCharacteristic(GATT_CHARACTERISTIC_RX_TX);

    rxtxCh.oncharacteristicvaluechanged = async (ev: any) => {
      const buf = ev.target.value.buffer;
      const data = this.textDecoder.decode(buf);

      if (data.startsWith('$LXWP0')) {
        const { altitude, vario } = this.parseLXWP0(data);
        btSv.altitude.next(altitude);
        if (vario.length > 0) {
          btSv.vario.next(vario[0])
        }
      } else if (data.startsWith('$LK8EX1')) {
        const { preassure, altitude, vario, temperature, batteryPercentage } = this.parseLk8ex1(data);
        btSv.preasure.next(preassure);
        // btSv.altitude.next(altitude); // Altitude from LK8EX1 is less perecise
        btSv.vario.next(vario / 100);
        btSv.temperature.next(temperature);
        btSv.batteryStatus.next(batteryPercentage);
      }
    };

    await rxtxCh.startNotifications();
  }


  public async deregister(btSv: BluetoothConnectionService, dev: BluetoothDevice): Promise<void> {
    await this.rxTxCharacteristic.stopNotifications();
    delete this.rxTxCharacteristic.oncharacteristicvaluechanged;
  }

  private parseLXWP0(data: string): Lxwp0Data {
    // Source: https://github.com/LK8000/LK8000/blob/master/Common/Source/Devices/devLX.cpp
    // $LXWP0,logger_stored, airspeed, airaltitude,
    //   v1[0],v1[1],v1[2],v1[3],v1[4],v1[5], hdg, windspeed*CS<CR><LF>
    //
    // 0 loger_stored : [Y|N] (not used in LX1600)
    // 1 IAS [km/h] ----> Condor uses TAS!
    // 2 baroaltitude [m]
    // 3-8 vario values [m/s] (last 6 measurements in last second)
    // 9 heading of plane (not used in LX1600)
    // 10 windcourse [deg] (not used in LX1600)
    // 11 windspeed [km/h] (not used in LX1600)
    //
    // e.g.:
    // $LXWP0,Y,222.3,1665.5,1.71,,,,,,239,174,10.1

    const values = data.split(',');
    const loggerStored = values[1] === 'Y';
    const altitude = +values[3];
    const vario = values.slice(4, 10).filter(v => v.length === 0).map(v => +v);

    return { loggerStored, altitude, vario };
  }
  private parseLk8ex1(data: string): Lk8ex1Data {
    // Source: https://github.com/LK8000/LK8000/blob/master/Common/Source/Devices/devLKext1.cpp
    // LK8EX1,pressure,altitude,vario,temperature,battery,*checksum

    // Field 0, raw pressure in hPascal:
    // 	hPA*100 (example for 1013.25 becomes  101325)
    // 	no padding (987.25 becomes 98725, NOT 098725)
    // 	If no pressure available, send 999999 (6 times 9)
    // 	If pressure is available, field 1 altitude will be ignored

    // Field 1, altitude in meters, relative to QNH 1013.25
    // 	If raw pressure is available, this value will be IGNORED (you can set it to 99999
    // 	but not really needed)!
    // 	(if you want to use this value, set raw pressure to 999999)
    // 	This value is relative to sea level (QNE). We are assuming that
    // 	currently at 0m altitude pressure is standard 1013.25.
    // 	If you cannot send raw altitude, then send what you have but then
    // 	you must NOT adjust it from Basic Setting in LK.
    // 	Altitude can be negative
    // 	If altitude not available, and Pressure not available, set Altitude
    // 	to 99999  (5 times 9)
    // 	LK will say "Baro altitude available" if one of fields 0 and 1 is available.

    // Field 2, vario in cm/s
    // 	If vario not available, send 9999  (4 times 9)
    // 	Value can also be negative

    // Field 3, temperature in C , can be also negative
    // 	If not available, send 99

    // Field 4, battery voltage or charge percentage
    // 	Cannot be negative
    // 	If not available, send 999 (3 times 9)
    // 	Voltage is sent as float value like: 0.1 1.4 2.3  11.2
    // 	To send percentage, add 1000. Example 0% = 1000
    // 	14% = 1014 .  Do not send float values for percentages.
    // 	Percentage should be 0 to 100, with no decimals, added by 1000!

    // Example:
    // $LK8EX1,88660,1112,1,21,1090,*1A

    const values = data.split(',');

    return {
      preassure: +values[1] / 100,
      altitude: +values[2],
      vario: +values[3],
      temperature: +values[4],
      batteryPercentage: +values[5] - 1000
    };
  }

}
