import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Path,
  Post,
  Put,
  Query,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { devicesService } from '../business-layer/devicesBl';
import { DeviceKind, ErrorResponse, LocalNetworkDevice } from '../models/sharedInterfaces';

@Tags('Devices')
@Route('devices')
export class DevicesController extends Controller {
  /**
   * Get all devices in the local network.
   * @returns Local network devices array.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get()
  public async getDevices(): Promise<LocalNetworkDevice[]> {
    return await devicesService.getDevices();
  }

  /**
   * Get all supported devices kind info.
   * @returns Local network devices array.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get('kinds')
  public async getDevicesKinds(): Promise<DeviceKind[]> {
    return await devicesService.getDevicesKins();
  }

  /**
   * Set name to a device.
   * @param deviceMac Device mac address.
   * @param newName The name to set.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Put('{deviceMac}')
  public async setDeviceName(deviceMac: string, @Body() device: LocalNetworkDevice): Promise<void> {
    device.mac = deviceMac;
    await devicesService.setDeviceName(device);
  }

  /**
   * Rescan all devices in LAN.
   * Used when there are changes in the local network.
   * For example, if the router (DHCP server) change IP's of devices or new device connect to the local network etc.
   */
  @Security('userAuth')
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Post('rescan')
  public async rescanDevices(): Promise<void> {
    await devicesService.rescanNetwork();
  }
}
