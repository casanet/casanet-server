# Home IoT Server
Node.js server with basic REST api for home IoT devices 

## Supported Right now
* Orvibo wiwo - S20
* Broadlink SP3
* Broadlink RM mini 3
* Kankun Smart Wifi Plug
* Xiaomi Yeelight Smart LED Ceiling Light
* Xiaomi Philips LED Ceiling Lamp
* Xiaomi Yeelight RGBW E27 Smart LED Bulb
* Itead Sonoff Wireless Smart Switch

### comming soon
 
* Broadlink SC1 Smart Switch

## Purpose
In this project, I came to solve a number of troublesome. first of all, anyone who uses a number of smart devices (smart ir, smart socket, or anything like that) of different companies knows the problem of dealing with a number of different applications,
hold 10 applications for each home appliance that each is completely different in the interface and operations and authentication,
it's a very annoying thing and in addition, the servers, some of which are small Chinese companies, do not always work well, so there is no external access, and there is no normal and clear message about why it does not work.

As a solution to this problem this project consolidates all the smart home appliances into one simple and clear and easy to access API.

It is runs on a computer at home (or any other device that can run node.js)
And to operate it at a basic level all you need to know is to get MAC address of eatch device,
And for access outside the internal network make sure that the address in your home is public and redirect ports to the computer running the server (DDNS is recommended for easy access to the home address).

The logic and design of the server is that there are several types of devices in the world, such as a lighting device, an AC device, and the like, and for each physical device its own module that realizes the capabilities that the device of its kind enables,(and the advanced options that each company realizes in a different way like timing, thrown), and on all devices there is a switch component with on\off option.

This structure enables the creation of a separate server, and a collection of modules that enable communication by implementing preset methods for each device type (such as the OOP interface).

## Run it
> This part is for the Windows operating system, of course you can run the server on Linux, but the connection with Orvibo Sockets is through .NET and it's a bit of a problem in Linux, so I did not try the server in Linux but everything else should work.
and there is no obligation to use the modules I wrote
So if you change such modules, you do not need to install Python or .Net
(.Net is for Orvibo module and python is for kankun and broadlink modules)

### Server installation :
1. Install Node.js 
1. Go to path of the project in CMD and press `npm install --save`
1. Go to `DB\devices.json` file and change the values (mac name brand etc.) to the correct data and save the structure (note that id should be unique)
1. Go to `DB\users.json` file and set user name and password
1. Run the server by pressing `node app.js` or clicking on `RunServer.bat` file

### Current Modules Dependencies installation :
1. Install .Net 
1. Install Python 2.7 At: `C:/Python27` (or change the value in: `modules\Commons\pythonHandler.js` line 7) 
1. Install Microsoft Visual C++ Compiler for Python 2.7 https://www.microsoft.com/en-us/download/details.aspx?id=44266 
1. Install pip (if not install yet by python installer) 
1. In cmd (in administration mode) press: `C:\Python27\Scripts\pip.exe install broadlink` <p style='color:red'> -- Note that API of broadlink module was recently changed ,so now it not working very soon the support will comeback. -- </p>

to read IR codes:
i recomended https://github.com/davorf/BlackBeanControl project that kept all in ini file easily or http://rm-bridge.fun2code.de/ , and after getting code, insert them to `modules\Broadlink\irCommandsMap.json` file. 

To get xiaomi token:
https://github.com/jghaanstra/com.xiaomi-miio/blob/master/docs/obtain_token_mirobot_new.md
or call device.discover() in https://github.com/aholstenson/miio#advanced-device-management

For yeelight devices:
Enable developer mode in yeelight app

Note that all modules work only after the device is connected to the internal network at home. To connect the appliance, use the official manufacturer's application.

for more information about token and ir codes see [Current Modules Explanations](#current-modules-explanations) 

For itead sonoff device:

Get the API device id (look like 1000xxxxxx) and put it in token filed of device in `DB\devices.json` file,
to know how to getting it read this excellent guide https://blog.ipsumdomus.com/sonoff-switch-complete-hack-without-firmware-upgrade-1b2d6632c01

In additional is need other server in local network to communicate with devices, the best option is to use this project
https://github.com/mdopp/simple-sonoff-server
 and after all set the currect server ip and port in `modules\Sonoff\sonoffConfig.json` file


## Using (web application)

> For HTTPS support change `USE_HTTPS = false` in `app.js` file (line 26)  to `true` and fill the certifications in `encryption` folder , the HTTPS will run on https://127.0.0.1:443/ and all requests will redirect to it.


http://127.0.0.1:3000/

very basic application (compatible to mobile)
Screenshots:
![screenshot](https://user-images.githubusercontent.com/28386247/33982470-4e18ab06-e0b9-11e7-8e05-378aede9def5.png)
![screenshot](https://user-images.githubusercontent.com/28386247/33982469-4de70592-e0b9-11e7-8007-770bf571c6ae.png)
![screenshot](https://user-images.githubusercontent.com/28386247/33982468-4dbb0136-e0b9-11e7-90bf-3d705805b33a.png)
![screenshot](https://user-images.githubusercontent.com/28386247/33982467-4d80d556-e0b9-11e7-9261-fa885c838b6a.png)

## Using (HTTP API)
> Note that content type (request and respons) are : `Content-Type : application/json`

### Athontication API

Login: POST http://127.0.0.1:3000/login
```javascript
{userName : 'myuser@domain.com', password : "myPass" } 
``` 
in body (users and passwords are in `DB\users.json` file)
and the authentication in every request is by unique cookie that live until logout or other client will post logout/all requst

To logout POST http://127.0.0.1:3000/logout
To logout all users POST http://127.0.0.1:3000/logout/all

### Devices API

Get all devices GET http://127.0.0.1:3000/devices 
```javascript
{
    "id0": {
        "mac": "34ea348ee66f",
        "name": "Dining AC",
        "brand": "Broadlink",
        "model": "RM3",
        "types": [
            "switch",
            "ac"
        ],
        "deviceIdentity": "SalonAC",
        "ip": "192.168.1.16",
        "vendor": "HangZhou Gubei Electronics Technology Co.,Ltd",
        "state": "off",
        "ac": {
            "mode": "hot",
            "fan_strength": "low",
            "temp": 16
        }
    },
    "id01": {
        "mac": "34ea34409ba8",
        "name": "Sleep AC",
        "brand": "Broadlink",
        "model": "RM3",
        "types": [
            "switch",
            "ac"
        ],
        "deviceIdentity": "SleepAC",
        "ip": "192.168.1.12",
        "vendor": "HangZhou Gubei Electronics Technology Co.,Ltd",
        "state": "off",
        "ac": {
            "mode": "hot",
            "fan_strength": "low",
            "temp": 21
        }
    },
    "id02": {
        "mac": "34ea3442a91b",
        "name": "Child AC",
        "brand": "Broadlink",
        "model": "RM3",
        "types": [
            "switch",
            "ac"
        ],
        "deviceIdentity": "MusheAC",
        "ip": "192.168.1.13",
        "vendor": "HangZhou Gubei Electronics Technology Co.,Ltd",
        "state": "off",
        "ac": {
            "mode": "hot",
            "fan_strength": "low",
            "temp": 20
        }
    },
    "id1": {
        "mac": "34ea34f5b7d2",
        "name": "Radiator",
        "brand": "Broadlink",
        "model": "SP2",
        "types": [
            "switch"
        ],
        "state": "error"
    },
    "id3": {
        "mac": "accf2334e632",
        "name": "Water heater",
        "brand": "Orvibo",
        "model": "S20",
        "types": [
            "switch"
        ],
        "ip": "192.168.1.22",
        "vendor": "Hi-flying electronics technology Co.,Ltd",
        "state": "off"
    },
    "id5": {
        "mac": "34ce00bc9b57",
        "name": "Sleep light",
        "brand": "Yeelight",
        "model": "Ceiling",
        "types": [
            "switch",
            "light",
            "white_temp"
        ],
        "token": "b726e337ade22fb026aa2f7dfbe4cd12",
        "ip": "192.168.1.72",
        "vendor": "XIAOMI Electronics,CO.,LTD",
        "state": "off",
        "bright": 1,
        "white_temp": 98
    },
    "id6": {
        "mac": "34ce0092edcf",
        "name": "Dining light",
        "brand": "Philips",
        "model": "Ceiling",
        "types": [
            "switch",
            "light",
            "white_temp"
        ],
        "token": "3d5f7ae53b51aa312e464b150b37453b",
        "ip": "192.168.1.26",
        "vendor": "XIAOMI Electronics,CO.,LTD",
        "state": "off",
        "bright": 50,
        "white_temp": 100
    },
    "id7": {
        "mac": "34ce008cd7bc",
        "name": "Child light",
        "brand": "Yeelight",
        "model": "E27-Bulb",
        "types": [
            "switch",
            "light",
            "white_temp",
            "light_color"
        ],
        "token": "28dc5d6c9a7c3ee43e3fe49a2038b4ea",
        "ip": "192.168.1.32",
        "vendor": "XIAOMI Electronics,CO.,LTD",
        "state": "on",
        "bright": 81,
        "white_temp": 95,
        "light_color": {
            "red": 1,
            "green": 1,
            "blue": 243
        }
    }
}    
```

Get device GET http://127.0.0.1:3000/devices/{id}
```javascript
{
    "mac": "34ea348ee66f",
    "name": "Dining AC",
    "brand": "Broadlink",
    "model": "RM3",
    "types": [
        "switch",
        "ac"
    ],
    "deviceIdentity": "SalonAC",
    "ip": "192.168.1.16",
    "vendor": "HangZhou Gubei Electronics Technology Co.,Ltd",
    "state": "off",
    "ac": {
        "mode": "hot",
        "fan_strength": "low",
        "temp": 16
    }
}
``` 
Chnage device value or state PUT http://127.0.0.1:3000/devices/{id}
And in body:
For every device set on or off
```javascript
{
    "type": "switch",
    "value" : "off"
}
``` 
To change value of light brightness:
```javascript
{
    "type": "light",
    "value": 44
}
```
To change value of light white temperature:
```javascript
{
    "type": "white_temp",
    "value": 48
}
```
To change value of light color:
```javascript
{
    "type": "light_color",
    "value": {
            "red": 20,
            "green": 255,
            "blue": 7
        }
}
```
To change value of ac:
```javascript
{
    "type": "ac",
    "value": {
            "mode" : "fan" , 
            "fan_strength": "low" , 
            "temp" : 23
        }
}
``` 

POST http://127.0.0.1:3000/refresh to scan agine all devices (Getting IPs and status)

### Events\Actions API
Event is a collection of actions to set devices status
 
Every event hold a array of action to do, when every action contains id of device, state and if it 
more than just switch it can declare in type field and set the wanted value in set fiele

Get all events GET http://127.0.0.1:3000/events 
```javascript
{
    "vwwrp55sq": {
        "name": "AC_Event",
        "actions": [
            {
                "deviceID": "id0",
                "type": "ac",
                "state": "on",
                "set": {
                    "mode": "fan",
                    "fan_strength": "low",
                    "temp": 22
                }
            }
        ]
    },
    "SynCp05sb": {
        "name": "Event1",
        "actions": [
            {
                "deviceID": "id3",
                "type": "switch",
                "state": "off"
            }
        ]
    },
    "H1MXuQzhW": {
        "name": "Event2",
        "actions": [
            {
                "deviceID": "id2",
                "type": "switch",
                "state": "on"
            },
            {
                "deviceID": "id6",
                "type": "light",
                "state": "on",
                "set": {
                    "bright": 5,
                    "color": 50
                }
            }
        ]
    }
}
``` 
Create new event POST http://127.0.0.1:3000/events 
with data in body like:
```javascript
{
    "name": "Event3",
    "actions": [
        {
            "deviceID": "id1",
            "type": "switch",
            "state": "on"
        },
        {
            "deviceID": "id3",
            "type": "light",
            "state": "on",
            "set": {
                "bright": 1,
                "color": 50
            }
        }
    ]
}
```
or to edit event by its id PUT http://127.0.0.1:3000/events/{id}
with body like posting new event
for remove event DELETE http://127.0.0.1:3000/events/{id}
and to invoke event POST http://127.0.0.1:3000/events/invoke/{id}

### Timings API

Timing can be set based on a specified event,
there is 3 types of timings
* daily, by days and time
* One-time, by date and time
* Timer, by minutes duration

to get all timings GET  http://127.0.0.1:3000/timings
```javascript
{
    "1": {
        "timingType": "daily",
        "days": [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday"
        ],
        "time": "19:50",
        "trigger": "H1MXuQzhW",
        "active": "off"
    },
    "2": {
        "timingType": "once",
        "date": "01-12-17",
        "time": "13:58",
        "trigger": "H1MXuQzhW",
        "active": "on"
    },
    "3": {
        "timingType": "timer",
        "durationInMinuts": 300,
        "startTime": "2017-12-28T14:12:37.805Z",
        "trigger": "H1MXuQzhW",
        "active": "off"
    }
}
```
for create new timing POST http://127.0.0.1:3000/timings 
with data in body like:
```javascript
{
   "timingType": "once",
   "date": "02-12-17",
   "time": "23:37",
   "trigger": "H1MXuQzhW",
   "active": "off"
}
```
or to edit timings by its id PUT http://127.0.0.1:3000/timings/{id}
with body like posting new timing
for remove timiming DELETE http://127.0.0.1:3000/timings/{id}


### Updates feed API

In addition to get update (by [SSE](https://en.wikipedia.org/wiki/Server-sent_events "Wikipedia")) when device status has changed:

http://127.0.0.1:3000/devices-feed
with struct:
```javascript
{
    "deviceID": "id2",
    "data": {
        "mac": "34ea34f1a482",
        "ip": "192.168.1.12",
        "name": "X",
        "brand": "Broadlink",
        "types": [
            "switch"
            ],
        "state": "on"
    }
}
```

when some timing triggered:

http://127.0.0.1:3000/timing-triggered-feed
with struct
```javascript
{
    "timingId": "vftthgde",
    "timing:": {
        "timingType": "once",
        "date": "02-12-17",
        "time": "23:37",
        "trigger": "testing"
    },
    "err" : ""
}
```

when timing changed:

http://127.0.0.1:3000/timing-feed
with struct like getting timing

### Static files serve API

To get static files (in public folder) GET http://127.0.0.1:3000/static/{path}

## Extand server modules
It is not really complicated but a bit required to understand some of the existing code
At the moment, I went from the server to external script programs in Python and cmd, the data is given with arguments and the results are called by reading the printing at the terminal.
To expand what is currently needed
* Create a `xxxHandler.js` file in a new folder named `xxx` in the `modules` folder that implement the methods of device type. Note that maintaining the structure of the arguments and callbacks as in the rest of the modules no matter how it works inside, 
the struct of 'interface' is for switch: 
```javascript
GetState(device, callback(state, err))
ChangeState(device, state, callback(err))
```
while `state` can be `on` of `off`

for light (brightness):
```javascript
GetBrightness(device, callback(value, err))
SetBrightness(device, value, callback(err))
```
while `value` is number between 1 - 100

for white temperature:
```javascript
GetColorTemperature(device, callback(value, err))
SetColorTemperature(device, value, callback(err))
```
while `value` is number between 1 - 100

for white temperature:
```javascript
GetRGB(device, callback(value, err))
SetRGB(device, value, callback(err))
```
while `value` is struct of 3 keys, `red` `green` and `blue` with value between 1 - 255  

for ac (air conditioner)
```javascript
GetACData(device, callback(value, err))
SetACData(device, value, callback(err))
```
while `value` is struct of keys 

`mode` can be : `auto` , `hot` , `cold` , `dry` , `fan`

`fan_strength` can be : `auto` , `high`, `med` , `low`

`temp` with value 16 - 30

note that in `device` you get the object from `DB\devices.json` so you can add a key of anything for example a token to communicate xiaomi devices and it will arrive in device parameter.

(If you need access to other languages, you can see how I used cmd or python in the other modules or any way you see fit).
* Give a new name to the device brand field in the `DB\devices.json` file
* Go to the `modules\brandModulesMap.js` file to add a require to the module you have written and add to `switch` in function `GetBrandModule` a `case` with the name you gave in the brand field and set return the module that you wrote.

## Current Modules Explanations
I tried to add installation instructions to all module dependencies, but I may have missed something I did not notice, so if something does not work try going to the original code of the module and see the installation instructions there

### Orvibo
very simple use by sending to .net cmd app mac ip and status to set as parameters and result is in console text

Dependencies:
* Install .Net

Credits:

Original code repositiry-
https://github.com/DynamicDevices/orvibocontroller
My Fork-
https://github.com/haimkastner/orvibocontroller


### Broadlink

for SP2 device is also simple by sending python script mac ip and action to do as parametrs

but for RM2 it is more complicated so what i did is:
map all codes in `modules\Broadlink\irCommandsMap.json` file by deviceIdentity filed in `devices.json` file , this is allow to hold several logic devices by one physical ir transmitter, 
and because the ir device can only send data , and it is no way to know the AC (or such device) status  
last action saved in cash file. 

to read IR codes i recomended https://github.com/davorf/BlackBeanControl project that kept all in ini file easily or http://rm-bridge.fun2code.de/ , and after getting code, insert them to map file. 

Dependencies:
* Install Python 2.7 At: `C:/Python27` (or change the value in: `modules\Commons\pythonHandler.js` line 7) 
* Install Microsoft Visual C++ Compiler for Python 2.7 https://www.microsoft.com/en-us/download/details.aspx?id=44266 
* Install pip (if not install yet by python installer) 

In cmd (in administration mode) press: 
* C:\Python27\Scripts\pip.exe install broadlink

Credits:

Original code repositiry-
https://github.com/NightRang3r/Broadlink-NodeSP2
My Fork-
https://github.com/haimkastner/Broadlink-NodeSP2


### xiaomi/yeelight
To send messages and receive information i  used `miio` protocol project 
The part of listening to the device when it changes by the remote that comes with the device as well as sending new color values I have done by project node-yeelight-wifi

to use `miio` protocol it need a token so after getting it insert it at token filed in `devices.json` file

To get xiaomi token
https://github.com/jghaanstra/com.xiaomi-miio/blob/master/docs/obtain_token_mirobot_new.md
or call device.discover() in https://github.com/aholstenson/miio#advanced-device-management

Credits:

https://www.npmjs.com/package/node-yeelight-wifi

https://www.npmjs.com/package/miio

### xiaomi/philips
To send messages and receive information i  used `miio` protocol project

For token see xiaomi/yeelight

### Kankun
simple, by sending python script mac ip and action to do as parametrs

Credits:

Original code repositiry-
https://github.com/0x00string/kankuncontroller
My Fork-
https://github.com/haimkastner/kankuncontroller

Dependencies:
* Installation of pyhthon (see in broadlink)  

### Sonoff / Itead

Simple HTTP requests to get or set the current device value.
only need the secret api device id in http request get it by this guide https://blog.ipsumdomus.com/sonoff-switch-complete-hack-without-firmware-upgrade-1b2d6632c01 and insert it in token filed in `devices.json` file, and need the ditails of local server in`sonoffConfig.json` file. 

Dependencies:
* Runing server of this excellent project https://github.com/mdopp/simple-sonoff-server


## Credits & Licence 
I used external libraries to communicate with sockets, and changed the code slightly to fit this project, 
Please note that usage licenses are limited by any restrictions set by the original code authors.

### TODO:
- [x] yeelight need refresh after start app
- [x] writing client side
- [ ] create better web app
- [ ] writing android application
- [x] logs and comments
