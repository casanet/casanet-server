# Home IoT Server
Node.js server with basic REST api for home IoT devices 

## Supported Right now
* Orvibo wiwo - S20
* Broadlink SP3
* Broadlink RM mini 3
* Kankun Smart Wifi Plug
* Xiaomi Yeelight Smart LED Ceiling Light
* Xiaomi Philips LED Ceiling Lamp

### comming soon
* Xiaomi Yeelight RGBW E27 Smart LED Bulb 
* Broadlink SC1 Smart Switch

## Purpose
In this project, I came to solve a number of troublesome. first of all, anyone who uses a number of smart devices (smart ir, smart socket, or anything like that) of different companies knows the problem of dealing with a number of different applications,
hold 10 applications for each home appliance that each is completely different in the interface and operations and authentication,
it's a very annoying thing and in addition, the servers, some of which are small Chinese companies, do not always work well, so there is no external access, and there is no normal and clear message about why it does not work.

As a solution to this problem this project consolidates all the smart home appliances into one simple and clear and easy to access API.

It is runs on a computer at home (or any other device that can run node.js)
And to operate it at a basic level all you need to know is to give static IP addresses to devices,
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
1. Go to `DB\devices.json` file and change the values to the correct data and save the structure (note that id should be unique)
1. Run the server by pressing `node app.js` or clicking on `RunServer.bat` file

### Current Modules Dependencies installation :
1. Install .Net 
1. Install Python 2.7 At: `C:/Python27` (or change the value in: `modules\Commons\pythonHandler.js` line 7) 
1. Install Microsoft Visual C++ Compiler for Python 2.7 https://www.microsoft.com/en-us/download/details.aspx?id=44266 
1. Install pip (if not install yet by python installer) 
1. In cmd (in administration mode) press: `C:\Python27\Scripts\pip.exe install broadlink`

to read IR codes:
i recomended https://github.com/davorf/BlackBeanControl project that kept all in ini file easily or http://rm-bridge.fun2code.de/ , and after getting code, insert them to `modules\Broadlink\irCommandsMap.json` file. 

To get xiaomi token:
https://github.com/jghaanstra/com.xiaomi-miio/blob/master/docs/obtain_token_mirobot_new.md
or call device.discover() in https://github.com/aholstenson/miio#advanced-device-management

Note that all modules work only after the device is connected to the internal network at home. To connect the appliance, use the official manufacturer's application.

for more information about token and ir codes see [Current Modules Explanations](#current-modules-explanations) 

## Using (web application)
http://127.0.0.1:3000/

very basic application (compatible to mobile)

## Using (HTTP API)
After the server runing we can access to all devices in devices.json file simply, 

to login POST http://127.0.0.1:3000/login
```javascript
{userName : 'myuser@domain.com', password : "myPass" } 
``` 
in body (users and passwords are in `DB\users.json` file)
and your IP address will be allow to access until logout

to logout POST http://127.0.0.1:3000/logout

to get all devices GET http://127.0.0.1:3000/devices 
```javascript
{
    "id0": {
        "mac": "34ea348ee66f",
        "ip": "192.168.1.30",
        "name": "IRDevice",
        "brand": "Broadlink",
        "types": [
            "switch",
            "ac"
        ],
        "deviceIdentity": "SalonAC",
        "state": "off",
        "ac": {
            "mode": "fun",
            "fun_strength": "low",
            "temp": 23
        }
    },
    "id1": {
        "mac": "34ea34f5b7d2",
        "ip": "192.168.1.25",
        "name": "a",
        "brand": "Broadlink",
        "types": [
            "switch"
        ],
        "state": "off"
    },
    "id2": {
        "mac": "accf2334e632",
        "ip": "192.168.1.22",
        "name": "b",
        "brand": "Orvibo",
        "types": [
            "switch"
        ],
        "state": "on"
    },
    "id3": {
        "mac": "34ce0092edcf",
        "ip": "192.168.1.21",
        "name": "c",
        "brand": "Philips",
        "types": [
            "switch",
            "light"
        ],
        "token": "3d5f7ae53b51aa312e464b150b37453b",
        "state": "on",
        "light": {
            "bright": 1,
            "color": 50
        }
    }
}
``` 
to get device status GET http://127.0.0.1:3000/devices/id1
```javascript
{
    "mac": "34ea34f5b7d2",
    "ip": "192.168.1.25",
    "name": "a",
    "brand": "Broadlink",
    "types": [
        "switch"
    ],
    "state": "on"
}
``` 
to chnage device value or state PUT http://127.0.0.1:3000/devices/id3 
```javascript
{
    "type": "switch",
    "value" : "off"
};
``` 
or to change only value of light:
```javascript
{
    "type": "light",
    "value": {
            "bright": 4,
            "color'": 44
        }
};
``` 
or to change only value of ac:
```javascript
{
    "type": "ac",
    "value": {
            "mode" : "fun" , 
            "fun_strength": "low" , 
            "temp" : 23
        }
};
``` 

and 

POST http://127.0.0.1:3000/refresh to scan all devices again (in LAN),

In addition to get update (by [SSE](https://en.wikipedia.org/wiki/Server-sent_events "Wikipedia")) of changes GET http://127.0.0.1:3000/devices-feed
with struct:
```javascript
            {
                "deviceID": "id2",
                "data": {
                    "mac": "34ea34f1a482",
                    "ip": "192.168.1.12",
                    "name": "X",
                    "brand": "Broadlink",
                    "types": ["switch"],
                    "state": "on"
                }
            }
```

to get static files (in public folder) GET http://127.0.0.1:3000/static/{path}

also the application support a events, 
that every event hold a array of action to do, when every action contains mac of device, state and if it 
more that just switch it can declare in type field and set the wanted value in set fiele

to get all events GET http://127.0.0.1:3000/events 
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
                    "mode": "fun",
                    "fun_strength": "low",
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
for create new event POST http://127.0.0.1:3000/events 
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
or to edit event by its id PUT http://127.0.0.1:3000/events/r1igRA5iZ
with body like posting new event
for remove event DELETE http://127.0.0.1:3000/events/r1igRA5iZ
and to invoke event POST http://127.0.0.1:3000/events/invoke/r1igRA5iZ

## Extand server modules
It is not really complicated but a bit required to understand some of the existing code
At the moment, I went from the server to external script programs in Python and cmd, the data is given with arguments and the results are called by reading the printing at the terminal.
To expand what is currently needed
* Create a `xxxxHandler.js` file in a new folder named `xxx` in the `modules` folder that implement the methods of device type. Note that maintaining the structure of the arguments and callbacks as in the rest of the modules no matter how it works inside, 
the struct of 'interface' is for switch: 
```javascript
GetState(device, callback(state, err))
ChangeState(device, state, callback(err))
```
while `state` can be `on` of `off`

for light:
```javascript
GetBrightnessAndColor(device, callback(value, err))
SetBrightnessAndColor(device, value, callback(err))
```
while `value` is struce of key `bright` with value 1 - 100 and `color` with value 1 - 100

for ac (air conditioner)
```javascript
GetACData(device, callback(value, err))
SetACData(device, value, callback(err))
```
while `value` is struct of keys 

`mode` can be : `auto` , `hot` , `cold` , `dry` , `fun`

`fun_strength` can be : `auto` , `high`, `med` , `low`

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

## Credits & Licence 
I used external libraries to communicate with sockets, and changed the code slightly to fit this project, 
Please note that usage licenses are limited by any restrictions set by the original code authors.

### TODO:
- [x] yeelight need refresh after start app
- [x] writing client side
- [ ] create better web app
- [ ] writing android application
- [ ] logs and comments
