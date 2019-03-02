## CASTANET mudules / drivers.

## How to connect my device to local network and how to add it to be managed by casa-net server?
Good question... depend on device protocol.

### Broadlink devices:
Connect device to local network by [official app](https://play.google.com/store/apps/details?id=com.broadlink.rmt).

Then scan it and add it by casa-net server.

### Orvibo devices:
Connect device to local network by [official app](https://play.google.com/store/apps/details?id=com.orvibo.irhost).

Then scan it and add it by casa-net server.

### Yeelight devices:
Connect device to local network by [official app](https://play.google.com/store/apps/details?id=com.yeelight.cherry).
then you have to [enable the LAN Control](https://www.yeelight.com/en_US/developer) 
see [intraction with pics](https://getyeti.co/posts/how-to-control-yeelight-and-your-smarthome-with-yeti). 

Then scan it and add it by casa-net server.

### Tuya devies:
Connect device to local network by [official app](https://play.google.com/store/apps/details?id=com.tuya.smart).
Note that a lot of chinese devices supported tuya API, see [tuyapi project](https://github.com/codetheweb/tuyapi).

then you need to get the devies id and devies key before it can access by casa-net server.
to get the id and key see [Linking a Tuya Device](https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP.md).

After you get the id and key (called token in casa-net) then scan it insert the id and key/token and add it to casa-net server. 
> Note that tuya device key changed each time that setting new local network SSID. and then the devices status became readonly until the casa-net update with the correct new key. 

> Note that tuya device can communicate by only one TCP connection, so if Tuya app is open the casa-net server could not communicate with device. 





# *** FOR DEVELOPMENT ONLY ***

To allow server communicate with many models and manufacturers each brand needs to write
own module that inherit from [brandModuleBase.ts](./brandModuleBase.ts').

So to create new brand / communication protocol module:
1) Fork the project.
1) Create new folder with brand name in `backend/src/modules`.
1) Create in new folder new ts file, name format `xxxxHandler.ts`.
1) Write class that inherit from [brandModuleBase.ts](./brandModuleBase.ts').
1) Write the mmodule communication code (getStatus / setStatus etc.).
1) Add import to new module in [modulesManager.ts](./modulesManager.ts') file (line 9). 
1) Create instance of module in [modulesManager.ts](./modulesManager.ts') file (line 58).
1) Build by `npm run build`.
1) Open PR ;).
