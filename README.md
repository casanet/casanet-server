![Screenshot](./docs/images/logo-wide.png)

Let's create a smart home, without giving anyone access to our house 😊

## CASANET
Open-source server to control Smart Home IoT devices in a local network.

[![CI CD Status](https://github.com/casanet/casanet-server/workflows/casanet%20server%20CI%20CD/badge.svg?branch=master)](https://github.com/casanet/casanet-server/actions)
[![Coverage Status](https://coveralls.io/repos/github/casanet/casanet-server/badge.svg?branch=master)](https://coveralls.io/github/casanet/casanet-server?branch=master)

The latest release binaries available to download from [casanet-server releases](https://github.com/casanet/casanet-server/releases)

## Philosophy
This project aims to resolve a number of issues plaguing most Smart Home systems

* *Lack of common interfaces*: Anyone who uses a number of smart devices (smart IR, smart sockets or anything of that kind) of different brands is familiar with the problem of having to deal with completely different applications, authentication methods, timings, operations etc. for each device.

* *Reliability & Stability*: To control home appliances from the internet, the devices communicate with the manufacture's servers, some of which belong to small companies that may "come and go" or have downtime issues. Client side service issues are also notoriously difficult to diagnose and resolve.

* *Accessibility*: Although that there is no good reason to disallow control of home appliances directly from the local network, most commercial home appliances allow control only via the manufacturer's servers, therefore rendering the device inoperable, (even from inside the LAN!) in case of connectivity issues.

* *Security*: The biggest problem with commercial IOT is security. We definitely do not want to entrust our home to any code produced by an IOT manufacturer as they are known for making some of the most insecure and dubious systems in existence. We want to use vetted, battle-tested and privacy oriented open-source assets in order to ensure the devices do not turn rouge or outright malicious. We want the ability to 
isolate our devices from the outside world whilst retaining all (or most) capabilities.  

As a solution to these problems, this project consolidates all the smart home appliances into one simple, clear and easy to access API.

The Casanet server can run on any computer type (x86, ARM) at home and does not required an internet connection to operate.

The Casanet server design is to manage abstract world devices and a collection of modules ("drives") for each physical device kind, to convert to/from an abstract device state to/from the physical device.

This allows to easily add support in vast devices kinds, and separately, control all of them in one dashboard, same timing/operation abilities and even open an easy to use modern API.

Each module/driver design to work only through a local network, let us disconnect the device for good from the internet.

### The Mobile Application

<a href='https://play.google.com/store/apps/details?id=casa.casanet.dashboard' target="_blank">
<img 
	width='280px' height='110px'
	alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'/>
</a>

The dashboard Android application assets (APK/AAB) also available [here](https://github.com/casanet/dashboard-app/releases).


### The Web Dashboard

## ✨✨✨ [Live Demo Dashboard](https://demo.dashboard.casanet.casa/) ✨✨✨

![Screenshot](https://raw.githubusercontent.com/casanet/dashboard-app/develop/assets/capture/desktop-capture.gif)

### The Mobile Dashboard
<img src="https://raw.githubusercontent.com/casanet/dashboard-app/develop/assets/capture/app1.jpg" alt="app1-dashboard"
	title="lite-dashboard screenshot" width="270" height="580" />
<img src="https://raw.githubusercontent.com/casanet/dashboard-app/develop/assets/capture/app2.jpg" alt="app2-dashboard"
	title="lite-dashboard screenshot" width="270" height="580" />
<img src="https://raw.githubusercontent.com/casanet/dashboard-app/develop/assets/capture/app3.jpg" alt="app3-dashboard"
	title="lite-dashboard screenshot" width="270" height="580" />

> For more details and information about the web & mobile interface see [dashboard-app](https://github.com/casanet/dashboard-app) repository.

### The Web Lightweight Dashboard

The (very) lightweight dashboard (only about 20kb of total assets) for old phones or very slow networks.

For the lightweight interface navigate to `[server-ip/host]/light-app/index.html`.

![Screenshot](https://raw.githubusercontent.com/casanet/lightweight-dashboard/develop/assets/capture.jpg)

> For more details and information about the lightweight interface see [lightweight-dashboard](https://github.com/casanet/lightweight-dashboard) repository.


> For the legacy dashboard see [frontend-v3](https://github.com/casanet/frontend-v3) repository.

## Running Casanet server on a local computer

To make it easy to use there are ready-to-use binaries [here](https://github.com/casanet/casanet-server/releases) just download the binary file (depend on your OS) and the `casanet.json` configuration file and run the executable file.

It's recommended to read the configuration section [here](./backend/README.md#configure-server). 

In order to set up Linux from scratch see [Linux deployment tutorial](./docs/LINUX.md) for a Linux based devices (for raspberry pi etc.)

## Project parts + technologies
* **[Casanet server](./backend/README.md):**
	* **Purpose:** Control the IoT devices in a local home network.
	* **Technologies:** [Node.js](https://nodejs.org/en/) (using TypeScript + [TSOA](https://github.com/lukeautry/tsoa)).
* **[Dashboard](https://github.com/casanet/dashboard-app):**
	* **Purpose:** Hybrid dashboard for web & mobile to control the IoT devices (using Casanet server API). 
	* **Technologies:** [react v17](https://reactjs.org/blog/2020/10/20/react-v17.html) (with [mui v5](https://mui.com/)) and [cordova](https://cordova.apache.org/).
* **[Remote server](https://github.com/casanet/remote-server):**
	* **Purpose:** Forward API requests from the wide internet to the local Casanet servers.
	* **Technologies:** [Node.js](https://nodejs.org/en/) (using TypeScript + [TSOA](https://github.com/lukeautry/tsoa) + [PostgreSQL](https://www.postgresql.org/)).
* **[Remote dashboard](https://github.com/casanet/remote-dashboard):**
	* **Purpose:** Management dashboard for the remote server admin (using remote server API)
	* **Technologies:** [Vue.js](https://vuejs.org/) (using [vue material](https://vuematerial.io/)).
* **[RF commands repository](https://github.com/casanet/rf-commands-repo):**
	* **Purpose:** Light-weight server to keep and serve RF commands (such as: IR, 433 MHz etc.) for appliances.
	* **Technologies:** Python 3.10.5 (using [Flask](https://palletsprojects.com/p/flask/) + [Mongodb](https://www.mongodb.com/)).
* **API (for local and remote server):**
	* **Technologies:** [Swagger](https://swagger.io/).

### Dashboard languages support
The UI is designed to support multi-Language using [i18](https://react.i18next.com/).

Current supported Languages:
* English
* Hebrew

Any support for other languages will be welcome.

## Accessing casanet server from the internet
The server needs to run on local home network. So, how does one access it via the local home network? How does one get access to the casanet local server from the internet?

#### Method 1: Port forwarding
Make sure that the IP address of your home is public and redirect ports in-home router to the computer that is running the casanet server.

(DDNS is recommended for easy access to the home IP address).

#### Method 2: Using casa remote server
The casa remote server is built for this, [casanet-remote](https://github.com/casanet/remote-server) run on cloud service and used to redirect API requests to the local server.

## Supported IoT devices / protocols

-  Orvibo (aka wiwo)

	-  S20 (socket). [link](https://www.aliexpress.com/item/2016-New-Orvibo-Home-Automation-EU-U-UK-AU-Standard-Smart-Power-Travel-Socket-Plug-4G/32793333967.html)

-  Broadlink

	-  SP3 (socket). [link](https://www.gearbest.com/smart-access-lock/pp_009282693865.html)
	-  RM mini 3 (As AC). [link](https://www.gearbest.com/alarm-systems/pp_009753807797.html)
	-  RM Pro (As AC / RF toggle / RF curtain). [link](https://www.gearbest.com/home-appliances-accessories/pp_009281768756.html)

-  Yeelight

	-  Light with temperature and brightness properties. [link](https://www.gearbest.com/round-ceiling-lights/pp_009555929473.html) and others.
	-  Light with RGBW properties. [link](https://www.gearbest.com/smart-bulbs/pp_009329720794.html) and others.
    
-  Tuya (aka smart life)

	-  Switch (3 or less gangs). [link](https://www.aliexpress.com/item/220V-EU-Standard-3-Gang-Control-LED-Indicate-TUYA-Smart-App-Light-Touch-Switch-work-with/32952608844.html) [link](https://www.aliexpress.com/item/WiFi-Smart-Boiler-Switch-Water-Heater-Smart-Life-Tuya-APP-Remote-Control-Amazon-Alexa-Echo-Google/32981607525.html) and others.
	-  Curtain switch. [link](https://www.aliexpress.com/item/Tuya-Smart-Life-WiFi-Curtain-Switch-for-Electric-Motorized-Curtain-Blind-Roller-Shutter-Google-Home-Amazon/33006009742.html) and others.

- Mi (aka xiaomi)
    
    -  Philips LED Ceiling Lamp. [link](https://www.gearbest.com/smart-ceiling-lights/pp_009933492211.html)
	-  Robot Vacuum. [link](https://www.gearbest.com/robot-vacuum/pp_440546.html)

- Tasmota (Rest API)
    
    - Switch (tested with [this](https://www.gearbest.com/robot-vacuum-accessories/pp_009661965579.html?wid=1433363) and [this](https://www.gearbest.com/alarm-systems/pp_009227681096.html?wid=1433363)) 
    - Air-conditioning (IR Transmitter) (tested with [this](https://www.aliexpress.com/item/33004692351.html) (after [flashing to Tasmota](https://blog.castnet.club/en/blog/flashing-tasmota-on-tuya-ir-bridge))

- Mock (for testing purpose)
    
    -  Toggle demo.
    -  Switch demo
    -  Air-conditioning demo.
    -  Light demo.
    -  Temperature light demo.
    -  Color light demo.
    -  Roller demo.
    -  Temperature Sensor.


- #[MQTT](http://mqtt.org/) module [MQTT drivers documentation](./backend/src/modules/mqtt/README.md).

	- *Supported types:*
    	-  Toggle.
    	-  Switch.
    	-  Air-conditioning.
    	-  Light
    	-  Temperature light.
    	-  Color light.
    	-  Roller.
	- *Supported drivers:*
		- Tasmota (MQTT API)
			- Switch (tested with [this](https://www.gearbest.com/robot-vacuum-accessories/pp_009661965579.html?wid=1433363) and [this](https://www.gearbest.com/alarm-systems/pp_009227681096.html?wid=1433363))
			- Color Bulb (tested with [this](https://www.aliexpress.com/item/1005001879808728.html?spm=a2g0o.cart.0.0.469738daTbeuwA&mp=1))

		- Shelly (MQTT API)
			- Button1 - (tested with [this](https://shop.shelly.cloud/shelly-button1-wifi-smart-home-automation#438))
			- Switch 1PM - (tested with [this](https://shop.shelly.cloud/shelly-1pm-wifi-smart-home-automation-1#51))
			- Duo - RGBW - (tested with [this](https://shop.shelly.cloud/shelly-bulb-rgbw-e27-wifi-smart-home-automation#436))
			- Temperature Sensor AddOn - (tested with [this](https://shop.shelly.cloud/temperature-sensor-addon-for-shelly-1-1pm-wifi-smart-home-automation#315))
    
## Connecting devices

How to connect a device to the local network and how to add it to be managed by the casa-net server?

see [here](./backend/src/modules/README.md) the brands modules documentation.

## Adding other devices support
Yes, it is possible and it's welcomed! see [modules documentation](./backend/src/modules/README.md#-for-development-only-).

## API

The full specs of API are documented in [SwaggerHub](https://app.swaggerhub.com/apis/haimkastner/casanet-local-server).


To try it out against the demo mock server go to [casanet-mock-server docs](https://casanet-mock-server.herokuapp.com/docs/#/)

For a running Casanet server use Swagger UI to make API calls in the `[local server IP]/docs` URL. 

### The casanet server tested on
* Windows - 10/7
* Linux - Ubuntu
* Raspberry PI - Raspbian
* Orange PI - Armbian (Debian-based)

## Contributing
  
Feel free to open an issue with a bug report or feature to develop for the next version.

For any suggestions or help feel free to contact.

## Privacy Statement

This project *doesn't* include any type of data collection and tracking, all data is stored *only* in the machine where the server runs inside.

Keep the machine safe and secure to keep your data in your hands only.

Using this server is own your own risk, and could contain sensitive data such as your users' email, name, devices key, etc.
 
Please secure your network, server machine, and your data :)

By using this project you agree to the [privacy policy](./docs/privacy-policy.md) please read it carefully.

## License

This application is an open-source code, under the GNU license.

In addition to the GNU terms of the license, any non-personal use requires full credit in a prominent position in the interface including a link to this page and [https://casanet.biz/](https://casanet.biz/)

בנוסף לתנאי הרישיון של GNU, כל שימוש לא אישי מצריך קרדיט מלא במיקום בולט בממשק כולל קישור לעמוד זה ול [https://casanet.biz/](https://casanet.biz/)

## Credits
* Logo and UX consulting [Ofek Avergil](https://il.linkedin.com/in/ofek-avergil-348260144).

Shared with :heart: by kastnet.
