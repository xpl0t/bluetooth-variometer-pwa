import { DeviceAdapter } from "@app-shared/device-adapters";

export type DeviceId = 'stodeus';

export interface Device {
  adapter: DeviceAdapter;
  gattServices: string[];

  features: DeviceFeatures;
}

export interface DeviceFeatures {
  battery: boolean;
  altitude: boolean;
  preasure: boolean;
  vario: boolean;
  temperature: boolean;
}
