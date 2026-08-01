import { IRoot } from "./Root";

export interface IDevice extends IRoot {
  deviceId: number;
  deviceToken: string;
  deviceName: string;
  deviceType: "sensor" | "actuator" | "hybrid";
  deviceStatus: "online" | "offline";
  deviceFirmwareVersion?: string;
  deviceMetadata?: object;
  deviceValues?: IDeviceValue[];
}

export interface IDeviceValue extends IRoot {
  deviceValueId: number;
  deviceValueDeviceId: number;
  deviceValueValue: string;
}
