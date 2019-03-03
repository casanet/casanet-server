![screenshot](https://user-images.githubusercontent.com/28386247/53685975-4b22bf80-3d2a-11e9-99c7-09b2093c8060.png)

Let's create a smart home, without giving anyone access to our house 😊.

## CASA-NET.
Open-source server to control IoT devices in a local home network.

## Philosophy.
In this project, I came to solve a number of troublesome. first of all, anyone who uses a number of smart devices (smart IR, smart socket, or anything like that) of different companies knows the problem of dealing with a number of different applications,
hold 10 applications for each home appliance that each is completely different in the interface and operations and authentication,
it's a very annoying thing and in addition, the servers, some of which are small Chinese companies, do not always work well, so there is no external access, and there is no normal and clear message about why it does not work.

And the biggest thing is a security issue, I don't want to trust any company code/server in my home. I want to use open-source only. when I can make sure that no one tracks me or any other malicious. 

As a solution to these problems this project consolidates all the smart home appliances into one simple and clear and easy to access API.
and it runs on a computer (or any other device that can run node.js, tested on Windows 10 and Linux Ubuntu) at home and does not require connection to the internet to work properly.

The logic and design of the server is that there are several types of devices in the world, such as a lighting device, an AC device, and the like, and for each physical device its own module that realizes the capabilities that the device of its kind enables,(and the advanced options that each company realizes in a different way like timing, thrown), and on all devices there is a switch component with on\off option.

This structure enables the creation of a separate server and a collection of modules that enable communication by implementing preset methods for each device type (such as the OOP interface).

## How its look like?
![screenshot](https://user-images.githubusercontent.com/28386247/53686146-2f201d80-3d2c-11e9-8d99-fb72a9255327.JPG)


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
* Broadlink RM mini 3.
* Broadlink RM Pro.
* Xiaomi Yeelight Smart LED Ceiling Light.
* Xiaomi Yeelight RGBW E27 Smart LED Bulb.
* Tuya 3 gangs switch.

## Supported soon.
* Kankun Smart Wifi Plug.
* Xiaomi Philips LED Ceiling Lamp.
* Itead Sonoff Wireless Smart Switch.
* [IFTTT](https://ifttt.com/discover) API.

## Adding other devices support.
Yes, it is possible and will be welcome, see [modules](./backend/src/modules/README.md#-for-development-only-).

## Main technologies.
* Node.js (TypeScript) - Server.
* Angular - Client.
* API - Swagger.

## TODO:
- [ ] Finish UI of casanet local server.
- [ ] Create remote server managments UI.
- [ ] Support RTSP devices. 

For any suggestion or help feel free to contact me.

## Credits
* Logo and UX help [Ofek Avergil](https://il.linkedin.com/in/ofek-avergil-348260144).

Shared with  ❤️  by kastnet.
