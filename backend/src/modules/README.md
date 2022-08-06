## Casanet modules/drivers

## How to connect my device to the local network and how to add it to be managed by the Casanet server?
Good question... depend on device protocol.

### Broadlink devices
Connect the device to a local network by [official app](https://play.google.com/store/apps/details?id=cn.com.broadlink.econtrol.international).

Then scan the local network by the Casanet server.

### Orvibo devices
Connect the device to a local network by [official app](https://play.google.com/store/apps/details?id=com.orvibo.irhost).

Then scan the local network by the Casanet server.

### Yeelight devices
Connect the device to a local network by [official app](https://play.google.com/store/apps/details?id=com.yeelight.cherry).
then you have to [enable the LAN Control](https://www.yeelight.com/en_US/developer) 
see [instruction with pictures](https://getyeti.co/posts/how-to-control-yeelight-and-your-smarthome-with-yeti). 

Then scan the local network by the Casanet server.

### Xiaomi (Miio) devices
Connect the device to a local network by [official app](https://play.google.com/store/apps/details?id=com.xiaomi.smarthome).
then you have to get the device token to see [Obtain Mi Home device token](https://github.com/jghaanstra/com.xiaomi-miio/blob/master/docs/obtain_token.md). 

Then scan the local network by the Casanet server.

### Tasmota devices

Tasmota is a great open-source firmware for ESP8266 based boards. see the project [here](https://github.com/arendst/Sonoff-Tasmota).
 
After flashing and configure the device to connect to the local home WIFI (there are many tutorials, for me [thats](https://www.youtube.com/watch?v=pVPPiYAo8NI) worked).

Then scan the local network by the Casanet server.

> This module using the HTTP API of Tasmota. and assuming that there is no username/password required.

### MQTT devices

MQTT is a great open-source publish-subscribe system for IoT devices.
 
For integration guide see [MQTT module](./mqtt/README.md)

### Tuya devices
Connect the device to a local network by [official app](https://play.google.com/store/apps/details?id=com.tuya.smart).
Note that a lot of Chinese devices supported Tuya API, see [Tuyapi project](https://github.com/codetheweb/tuyapi).

Then you need to get the device id and key before it can reach by the Casanet server.
to get the id and key see [Linking a Tuya Device](https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP.md).

After you get the id and key (called token in Casanet) then scan it insert the id and key/token and add it to the Casanet server. 
> Note that the Tuya device key changed each time that setting a new local network SSID. and then the device's status became read-only until the Casanet update with the correct new key. 

> Note that the Tuya device can communicate by only one TCP connection, so if the Tuya app is open the Casanet server could not communicate with the device. 

# *** FOR DEVELOPMENT ONLY ***

To allow a server to communicate with many models and manufacturers each brand needs to write
own module that inherits from [brandModuleBase.ts](./brandModuleBase.ts).

So to create a new brand/communication protocol module:
1) Fork the project.
1) Create a new folder with the brand name in `backend/src/modules`.
1) Create in the new folder new ts file, name format `xxxxHandler.ts`.
1) Write a class that inherits from [brandModuleBase.ts](./brandModuleBase.ts).
1) Write the module communication code (getStatus / setStatus etc.).
1) Add import to the new module in [modulesManager.ts](./modulesManager.ts#L9) file (line 9). 
1) Create an instance of the module in [modulesManager.ts](./modulesManager.ts#L71) file (line 71).
1) Build by `npm run build`.
1) Open PR ;).

You can see a demo of [brandModuleBase.ts](./brandModuleBase.ts) API and used by watch the [mock](./mock/mockHandler.ts) module.
