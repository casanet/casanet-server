## CASANET mudules / drivers.

## How to connect my device to the local network and how to add it to be managed by the casa-net server?
Good question... depend on device protocol.

### Broadlink devices:
Connect the device to a local network by [official app](https://play.google.com/store/apps/details?id=com.broadlink.rmt).

Then scan the local network by the casa-net server.

### Orvibo devices:
Connect the device to a local network by [official app](https://play.google.com/store/apps/details?id=com.orvibo.irhost).

Then scan the local network by the casa-net server.

### Yeelight devices:
Connect the device to a local network by [official app](https://play.google.com/store/apps/details?id=com.yeelight.cherry).
then you have to [enable the LAN Control](https://www.yeelight.com/en_US/developer) 
see [intraction with pics](https://getyeti.co/posts/how-to-control-yeelight-and-your-smarthome-with-yeti). 

Then scan the local network by the casa-net server.

### Tuya devies:
Connect the device to a local network by [official app](https://play.google.com/store/apps/details?id=com.tuya.smart).
Note that a lot of Chinese devices supported tuya API, see [tuyapi project](https://github.com/codetheweb/tuyapi).

Then you need to get the device id and key before it can access by the casa-net server.
to get the id and key see [Linking a Tuya Device](https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP.md).

After you get the id and key (called token in casa-net) then scan it insert the id and key/token and add it to the casa-net server. 
> Note that the tuya device key changed each time that setting a new local network SSID. and then the device's status became read-only until the casa-net update with the correct new key. 

> Note that the tuya device can communicate by only one TCP connection, so if the Tuya app is open the casa-net server could not communicate with the device. 





# *** FOR DEVELOPMENT ONLY ***

To allow a server to communicate with many models and manufacturers each brand needs to write
own module that inherits from [brandModuleBase.ts](./brandModuleBase.ts).

So to create new brand / communication protocol module:
1) Fork the project.
1) Create a new folder with the brand name in `backend/src/modules`.
1) Create in the new folder new ts file, name format `xxxxHandler.ts`.
1) Write a class that inherits from [brandModuleBase.ts](./brandModuleBase.ts).
1) Write the module communication code (getStatus / setStatus etc.).
1) Add import to the new module in [modulesManager.ts](./modulesManager.ts) file (line 9). 
1) Create an instance of the module in [modulesManager.ts](./modulesManager.ts) file (line 58).
1) Build by `npm run build`.
1) Open PR ;).

You can see a demo of [brandModuleBase.ts](./brandModuleBase.ts) API and used by watch the [mock](./mock/mockHandler.ts) module.
