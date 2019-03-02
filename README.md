![screenshot](https://user-images.githubusercontent.com/28386247/53685975-4b22bf80-3d2a-11e9-99c7-09b2093c8060.png)

Let's create a smart home, without giving anyone access to our house 😊.

## CASA-NET.
Open-source server to control IoT devices in local home network.

## Philosophy.
In this project, I came to solve a number of troublesome. first of all, anyone who uses a number of smart devices (smart ir, smart socket, or anything like that) of different companies knows the problem of dealing with a number of different applications,
hold 10 applications for each home appliance that each is completely different in the interface and operations and authentication,
it's a very annoying thing and in addition, the servers, some of which are small Chinese companies, do not always work well, so there is no external access, and there is no normal and clear message about why it does not work.

And the biggest thing, is a security issue, I dont want to trust any company code/server in my home. I want to use open-source only. when I can make sure that no one track me or any other malicious. 

As a solution to this problems this project consolidates all the smart home appliances into one simple and clear and easy to access API.
and is runs on a computer (or any other device that can run node.js, tested on windows 10 and linux ubuntu) at home and do not require connection to internet to work properly.

The logic and design of the server is that there are several types of devices in the world, such as a lighting device, an AC device, and the like, and for each physical device its own module that realizes the capabilities that the device of its kind enables,(and the advanced options that each company realizes in a different way like timing, thrown), and on all devices there is a switch component with on\off option.

This structure enables the creation of a separate server, and a collection of modules that enable communication by implementing preset methods for each device type (such as the OOP interface).

## How its look like?
![screenshot](https://user-images.githubusercontent.com/28386247/53686146-2f201d80-3d2c-11e9-8d99-fb72a9255327.JPG)


### UI Languages support.
The UI built to be multi-Language support.

Current Languages supported:
* English
* Hebrew

Any support for other languages will be welcome.

## How to use it?
* Run casa-net server in home network [see documentation](./backend).
* Run casa-net remote server in cloud service [see documentation](./remote).

## How to access casanet from wide internet?
The server needs to run on local home network, so how to access it via internet?

#### Method 1: Port forwarding. 
Make sure that the address in your home is public and redirect ports in home router to the computer that running casa-net server.

(DDNS is recommended for easy access to home address).

#### Method 2: Using casa remote server.
The casa remote server is build for it, [casanet-remote](./remote) run on cloud service and to redirect API requests to local server.

So to use it, run it on cloud and connect local server to him using auth API. and then its possible to access local server.
Note that remote server not saving any data (except local servers and users sessions), only redirecting requests to local server.

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


## Main technologies.
* Node.js (TypeScript) - Server.
* Angular - Client.
* API - Swagger.

## TODO:
- [ ] Finish UI of local server.
- [ ] Create remote server managments UI.
- [ ] Support RTSP devices. 

For any suggestion or help feel free contact me.

## Credits
* Logo and UX help [Ofek Avergil](https://il.linkedin.com/in/ofek-avergil-348260144).

Shared with  ❤️  by kastnet.
