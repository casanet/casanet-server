"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const devicesBl_1 = require("../business-layer/devicesBl");
let DevicesController = class DevicesController extends tsoa_1.Controller {
    /**
     * Get all devices in local network.
     * @returns Local network devices array.
     */
    async getDevices() {
        return await devicesBl_1.DevicesBlSingleton.getDevices();
    }
    /**
     * Get all supported devices kind info.
     * @returns Local network devices array.
     */
    async getDevicesKinds() {
        return await devicesBl_1.DevicesBlSingleton.getDevicesKins();
    }
    /**
     * Set new name to device.
     * @param deviceMac Device mac address.
     * @param newName New name to set.
     */
    async setDeviceName(deviceMac, device) {
        device.mac = deviceMac;
        await devicesBl_1.DevicesBlSingleton.setDeviceName(device);
    }
    /**
     * Rescan all device in LAN.
     * Use when there is changes in local network.
     * For example if the router (DHCP server) change IP's of devices , or new device in network etc.
     */
    async rescanDevices() {
        await devicesBl_1.DevicesBlSingleton.rescanNetwork();
    }
};
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get()
], DevicesController.prototype, "getDevices", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('kinds')
], DevicesController.prototype, "getDevicesKinds", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('{deviceMac}'),
    __param(1, tsoa_1.Body())
], DevicesController.prototype, "setDeviceName", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('rescan')
], DevicesController.prototype, "rescanDevices", null);
DevicesController = __decorate([
    tsoa_1.Tags('Devices'),
    tsoa_1.Route('devices')
], DevicesController);
exports.DevicesController = DevicesController;
//# sourceMappingURL=devicesController.js.map