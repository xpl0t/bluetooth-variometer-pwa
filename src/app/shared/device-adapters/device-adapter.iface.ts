import { BluetoothConnectionService } from "@app-shared/bluetooth-connection";

export interface DeviceAdapter {
  register(btSv: BluetoothConnectionService, dev: BluetoothDevice): Promise<void>;
  deregister(btSv: BluetoothConnectionService, dev: BluetoothDevice): Promise<void>;
}
