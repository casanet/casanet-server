> The version 1 of the project placed in [here](https://github.com/haimkastner/Home-IoT-Server/tree/archive-v1), maintaining for security and fatal bugs fixes only.
---

![Screenshot](./docs/images/logo-wide.png)

Let's create a smart home, without giving anyone access to our house 😊.

## CASA-NET.
Open-source server to control IoT devices in a local home network.

## Philosophy.
In this project, I came to solve a number of troublesome. first of all, anyone who uses a number of smart devices (smart IR, smart socket, or anything like that) of different companies knows the problem of dealing with a number of different applications,
hold 10 applications for each home appliance that each is completely different in the interface and operations and authentication,
it's a very annoying thing and in addition, the servers, some of which are small Chinese companies, do not always work well, so there is no external access, and there is no normal and clear message about why it does not work.

And the biggest thing is a security issue, I don't want to trust any company code/server in my home. I want to use open-source only. when I can make sure that no one tracks me or any other malicious code runnig in my home. also, I want to block all of my Chinese devices from  communicating any server outside my local network.   

As a solution to these problems this project consolidates all the smart home appliances into one simple and clear and easy to access API.
and it runs on a computer (or any other device that can run node.js, tested on Windows 10 and Linux Ubuntu) at home and does not require connection to the internet to work properly.

The logic and design of the server is that there are several types of devices in the world, such as a lighting device, an AC device etc, and for each physical device its own module that realizes the capabilities that the device of its kind enables,(and the advanced options that each company realizes in a different way like timing, thrown), and on all devices there is a switch component with on\off option.

This structure enables the creation of a separate server and a collection of modules that enable communication by implementing preset methods for each device type (such as the OOP interface).

## How does it look?
![Screenshot](./docs/screenshots/dashboard.PNG)
![Screenshot](./docs/screenshots/operations.PNG)
![Screenshot](./docs/screenshots/timings.PNG)
![Screenshot](./docs/screenshots/devices.PNG)

Minimal page (only 5 kb of resources should be transferred !!!) for old phones or very slow networks.
![Screenshot](./docs/screenshots/light-dashboard.jpg)

Link to the minimal page exist in the settings 'light version' section, or just navigate to `[server-ip/host]/static/light-app/index.html`.

### UI Languages support.
The UI built to be multi-Language support.

Current Languages supported:
* English
* Hebrew

Any support for other languages will be welcome.

## How to use it?
* Run casa-net server in a home network [see documentation](./backend/README.md).
* Run casa-net remote server in cloud service [see documentation](./remote/README.md).

## How to access casanet from wide internet?
The server needs to run on local home network, so how to access it via internet?

#### Method 1: Port forwarding. 
Make sure that the address in your home is public and redirect ports in home router to the computer that running casa-net server.

(DDNS is recommended for easy access to home address).

#### Method 2: Using casa remote server.
The casa remote server is built for it, [casanet-remote](./remote/README.md) run on cloud service and to redirect API requests to the local server.

## Supported Right now.
* Orvibo wiwo - S20.
* Broadlink SP3.
* Broadlink RM mini 3 (As AC).
* Broadlink RM Pro (As AC / RF toggle).
* Xiaomi Yeelight with temperature/brightness options.
* Xiaomi Yeelight with RGBW option.
* Tuya/SmartLife, with 3 (or less) gangs switch.
* Xiaomi Mi Philips LED Ceiling Lamp.
* Xiaomi Mi Robot Vacuum.
* [IFTTT](https://ifttt.com/discover) Using [WebHooks](https://ifttt.com/maker_webhooks) API.

## Supported soon.
* Kankun Smart Wifi Plug.
* Itead Sonoff Wireless Smart Switch.

## Adding other devices support.
Yes, it is possible and will be welcome, see [modules](./backend/src/modules/README.md#-for-development-only-).

## Using scenario:
- Buy new [supported](#supported-right-now) smart devices.
- [Connect it to local network](./backend/src/modules/README.md) via official app.
- Scan the local network to find the new device. 
    ![Screenshot](./docs/screenshots/instructions/scan_devices.png)

    And give a name for the device (optionally).
    ![Screenshot](./docs/screenshots/instructions/set_device_name.png)

- Create a new minion** from the device.
    ![Screenshot](./docs/screenshots/instructions/create_minion.png)

- Say hello to the new minion and change the current status ;)

- Create a new operation.
    ![Screenshot](./docs/screenshots/instructions/create_operation.png)

- Create new timing that invoked the created operation
    ![Screenshot](./docs/screenshots/instructions/create_timing.png)

- Enjoy.

To watch full API specs use [swagger UI](https://petstore.swagger.io/) and put `https://raw.githubusercontent.com/haimkastner/Home-IoT-Server/master/backend/swagger.yaml` in explorer input.

**
Minion is a logic device in the system, meaning that a device is a physical device and minion is a logic device that uses a physical device to switch home kit status. For example, an IR transmitter can be one physical device for a few minions, one to central AC control and second for secondary AC control so in it will be two totally  different minions that use one physical device.

## IFTTT integration.
The [IFTTT](https://ifttt.com/discover) ecosystem is great ;). 
Now, invoking trigger when a minion turned on/off or turning on/off minion when any IFTTT trigger invoked is possible.

The integration is using [WebHooks](https://ifttt.com/maker_webhooks) API.

Receiving invoked triggers allow only if casa-net server accessible via public internet or via a remote server.

Invoking trigger when a device turned on/off the local server require an internet connection.  

See [step by step instraction](./docs/IFTTT.md) to use IFTTT.

## Main technologies.
* Node.js (TypeScript) - Server.
* Angular (with angular material) - Client.
* API - Swagger.

## TODO:
- [X] Finish UI of casanet local server.
- [ ] Create remote server managments UI.
- [ ] Support RTSP devices. 

For any suggestion or help feel free to contact me.

## Credits
* Logo and UX consulting [Ofek Avergil](https://il.linkedin.com/in/ofek-avergil-348260144).

Shared with  ❤️  by kastnet.
