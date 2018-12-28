import { Body, Controller, Get, Header, Path, Post, Query, Route, SuccessResponse } from 'tsoa';
import { Device } from '../models/interfaces';
@Route('Devices')
export class UsersController extends Controller {
    @Get('{deviceId}')
    public async getDevice(deviceId: string): Promise<Device> {
        return {
            ip: '192.168.1.1',
            mac: 'aa:bb:cc:dd',
            name: 'device demo',
        };
        // TODO: await new DevicesService().get(id);
    }

    @Post()
    public async createUser(@Body() requestBody: Device): Promise<void> {
        // TODO ...
        return;
    }
}
