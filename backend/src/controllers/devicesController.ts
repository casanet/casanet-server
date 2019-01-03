import { Body, Controller, Delete, Get, Header, Path, Post, Put, Query, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { Device, DeviceKind, ErrorResponse } from '../models/sharedInterfaces';

@Tags('Devices')
@Route('devices')
export class DevicesController extends Controller {

    /**
     * Get all devices in local network.
     * @returns Local network devices array.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getDevices(): Promise<Device[]> {
        return [{
            ip: '192.168.1.1',
            mac: 'aa:bb:cc:dd',
            name: 'device demo',
            brand: '',
            model: '',
        }];
        // TODO: await new DevicesService().get(id);
    }

    /**
     * Get all supported devices kind info.
     * @returns Local network devices array.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('kinds')
    public async getDevicesKinds(): Promise<DeviceKind[]> {
        return [];
        // TODO: await new DevicesService().get(id);
    }

    /**
     * Set new name to device.
     * @param deviceMac Device mac address.
     * @param newName New name to set.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{deviceMac}')
    public async setDeviceName(deviceMac: string, @Body() newName: DeviceName): Promise<void> {
        // TODO ...
        return;
    }

    /**
     * Rescan all device in LAN.
     * Use when there is changes in local network.
     * For example if the router (DHCP server) change IP's of devices , or new device in network etc.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('rescan')
    public async rescanDevices(): Promise<void> {
        // TODO ...
        return;
    }
}

/**
 * Simple struct for updating device name requests.
 */
export declare interface DeviceName {
    name: string;
}
