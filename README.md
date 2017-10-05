# Home IoT Server
Node.js server with basic REST api for home IoT devices 

## Supported Right now
* Orvibo wiwo - S20
* Broadlink SP3
* Kankun Smart Wifi Plug
* Xiaomi Yeelight Smart LED Ceiling Light
* Xiaomi Philips LED Ceiling Lamp

## Purpose
Instead of managing each smart socket (or any device with an on / off option) in a separate API for each brand, even though their operation is quite similar, we will consolidate all into one API and only behind the scenes will we perform the logical operations of the I / O for each brand according to its protocol. 
Which is why I completely ignored the advanced capabilities of the smart devices from all the companies and left only a simple API With such a structure: 

Each device "realizes" a switch interface
Which enables receiving status, turning on and off
Each lighting device "realizes" a light interface that also allows changing brightness and color temperature
And later the "realization" will be added to a color lighting device that will also be able to edit color details (RGB)
(In addition to being a standard lighting fixture and a standard switch)
And an interface will be added to the air conditioner that will allow controling the temperature, fan volume and operating status (heat, cold and ventilation)

And so in this way we maintain a rigid and basic structure that allows us to "talk" with each device without knowing its mode of operation and its unique protocol.

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
or:
```javascript
{
    "type": "light",
    "value": {
            "bright": 4,
            "color'": 44
        }
};
``` 

and 

POST http://127.0.0.1:3000/refresh to scan all devices again (in LAN),

In addition to get update (by SSE https://en.m.wikipedia.org/wiki/Server-sent_events) of changes GET http://127.0.0.1:3000/devices-feed

to get static files (in public folder) GET http://127.0.0.1:3000/static/{{path}}

also the application support a events, 
that every event hold a array of action to do, when every action contains mac of device, state and if it 
more that just switch it can declare in type field and set the wanted value in set fiele

to get all events GET http://127.0.0.1:3000/events 
```javascript
{
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
for light:
```javascript
GetBrightnessAndColor(device, callback(value, err))
SetBrightnessAndColor(device, value, callback(err))
```
note that in `device` you get the object from `DB\devices.json` so you can add a key of anything for example a token to communicate xiaomi devices and it will arrive in device parameter.

(If you need access to other languages, you can see how I used cmd or python in the other modules or any way you see fit).
* Give a new name to the device brand field in the `DB\devices.json` file
* Go to the `modules\brandModulesMap.js` file to add a require to the module you have written and add to `switch` in function `GetBrandModule` a `case` with the name you gave in the brand field and set return the module that you wrote.

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
- [ ] writing ui (client side)
- [ ] logs and comments
