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
(try convincing your wife that the light in the living room will light up with the Broadlink app and the light in the bedroom will light up with the Xiaomi app) and in addition, the servers, some of which are small Chinese companies, do not always work well, so there is no external access, and there is no normal and clear message about why it does not work.

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
1. Run the server by pressing `node app.js` or clicking the ActiveServer.bat file

### Current modules dependents:
1. Install Python 2.7 At: `C:/Python27` (or change the value in: `modules\Commons\pythonHandler.js` line 7) 
1. Install .Net

If there are errors in the cmd window, note that you have set all the variables that the external libraries I have used have been properly arranged (the links to these projects are attached at the end of the page)


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
        "name": "מיזוג חדש בסלון",
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

to get static files (in public folder) GET http://127.0.0.1:3000/static/{{path}}

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

### Orvibo
very simple use by sending to .net cmd app mac ip and status to set as parameters and result is in console text

### Broadlink

for SP2 device is also simple by sending python script mac ip and action to do as parametrs

but for RM2 it is more difficult so what i did is:
i maped all codes in `xx` file (to read them i recomended this project that kept all in ini file eusy)
and saved all last action in cash file becuase the tecnolege is very bad

// TODO
### xiaomi/yeelight
// TODO
### xiaomi/philips
// TODO

## Credits & Licence 
 I used external libraries to communicate with sockets, and changed the code slightly to fit this project, so I will give a link to the original code repositiry and in addition to the fork I created for the changes,
Please note that usage licenses are limited by any restrictions set by the original code authors.


### links
For BroadLink sockests:
Original code repositiry-
https://github.com/NightRang3r/Broadlink-NodeSP2
My Fork-
https://github.com/haimkastner/Broadlink-NodeSP2

For Orvibo sockests:
Original code repositiry-
https://github.com/DynamicDevices/orvibocontroller
My Fork-
https://github.com/haimkastner/orvibocontroller

For Kankun sockests:
Original code repositiry-
https://github.com/0x00string/kankuncontroller
My Fork-
https://github.com/haimkastner/kankuncontroller

For yeelight:
https://www.npmjs.com/package/node-yeelight-wifi

For Xiaomi philips:
https://www.npmjs.com/package/miio

To get xiaomi token (for current yeelight and philips modules)
https://github.com/jghaanstra/com.xiaomi-miio/blob/master/docs/obtain_token_mirobot_new.md
or call device.discover() in https://github.com/aholstenson/miio#advanced-device-management

### TODO:
- [x] yeelight need refresh after start app
- [ ] writing client side (in web tech, and android application)
- [ ] logs and comments
