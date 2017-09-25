# Home IoT Server
Node.js server with basic REST api for home IoT devices 

### Suppoted Right now
* Orvibo wiwo - S20
* Broadlink SP3
* Kankun Smart Wifi Plug
* Xiaomi Yeelight Smart LED Ceiling Light
* Xiaomi Philips LED Ceiling Lamp

### Operating instructions and use:

* `Purpose`: Instead of managing each smart socket (or any device with an on / off option) in a separate API for each brand, even though their operation is quite similar, we will consolidate all into one API and only behind the scenes will we perform the logical operations of the I / O for each brand according to its protocol. 
Which is why I completely ignored the advanced capabilities of the smart devices from all the companies and left only a simple API With such a structure: 

Each device "realizes" a switch interface
Which enables receiving status, turning on and off
Each lighting device "realizes" a light interface that also allows changing brightness and color temperature
And later the "realization" will be added to a color lighting device that will also be able to edit color details (RGB)
(In addition to being a standard lighting fixture and a standard switch)
And an interface will be added to the air conditioner that will allow a change in the temperature of the ventilation volume and the status (cold heat or air)

And so in this way we maintain a rigid and basic structure that allows us to "talk" with each device without knowing its mode of operation and its unique protocol.

* `Run it` : This part is for the Windows operating system, of course you can run the server on Linux, but the connection with Orvibo Sockets is through .NET and it's a bit of a problem in Linux, so I did not try the server in Linux but everything else should work.

Note that .Net is for Orvibo device only and python is for kankun and broadlink devices

1. Install Node.js
1. Install Python 2.7 At: `C:/Python27` (or change the value in: `modules\Commons\pythonHandler.js` line 7)
1. Install .Net
1. Go to location of the files in CMD and enter `npm install`
1. Go to `DB\devices.json` file and change the values to the correct data and save the structure
1. Run the server by pressing `node app.js` or clicking the ActiveServer.bat file

If there are errors in the cmd window, note that you have set all the variables that the external libraries I have used have been properly arranged (the links to these projects are attached at the end of the page)


* `Using`   : so, after the server runing we can access to all devices in devices.json file simply, 
to get all 'switchers'  status GET http://127.0.0.1:3000/switchers 
```javascript
[
    {
        "mac": "34ea34f5b7d2",
        "ip": "192.168.1.25",
        "name": "A",
        "state": true
    },
    {
        "mac": "34ea34f1a482",
        "ip": "192.168.1.12",
        "name": "B",
        "state": false
    }
]
``` 
to get switch status GET http://127.0.0.1:3000/switchers/34ea34f5b7d2
```javascript
{
    "mac": "34ea34f5b7d2",
    "ip": "192.168.1.25",
    "name": "A",
    "state": false
}
``` 
to switch device status PUT http://127.0.0.1:3000/switchers/34ea34f5b7d2 
```javascript
{state : 'on' } 
``` 
in body to turn on or 
```javascript
{state : 'off' } 
``` 
to turn off

to get all 'lights'  status GET http://127.0.0.1:3000/lights 
```javascript
[
    {
        "mac": "34ce00bc9b57",
        "ip": "192.168.1.16",
        "name": "C",
        "value": {
            "bright": 100,
            "color": 1
        }
    },
    {
        "mac": "34ce0092edcf",
        "ip": "192.168.1.21",
        "name": "D",
        "value": {
            "bright": 10,
            "color": 30
        }
    }
]
``` 
to get light value GET http://127.0.0.1:3000/lights/34ce00bc9b57
```javascript
{
    "mac": "34ce00bc9b57",
    "ip": "192.168.1.16",
    "name": "C",
    "value": {
        "bright": 100,
        "color": 1
    }
}
``` 
to set lights value PUT http://127.0.0.1:3000/lights/34ce00bc9b57 
```javascript
{bright : 50 , color : 45 } 
``` 
in body to change value of light

and 

POST http://127.0.0.1:3000/refresh/switchers http://127.0.0.1:3000/refresh/lights to scan again in LAN,

In addition to get update (by SSE obj) of changes in devices status GET http://127.0.0.1:3000/switchers-feed (you can simply enter this url in chrom and see updates in live)
* `Extand`: Not really complicated but a bit required to understand some of the existing code
At the moment, I went from the server to external script programs in Python and cmd, the data is given with arguments and the results are called by reading the printing at the terminal.
To expand what is currently needed
1. Create a `xxxxHandler.js` file in a new folder named `xxx` in the `modules` folder that allows you to receive status and change status. Note that maintaining the structure of the arguments and callbacks as in the rest of the modules no matter how it works inside
(If you need access to other languages, you can see how I used cmd or python in the other modules or any way you see fit).
1. Give a new name to the brand field in the `DB\sockets.json` file
1. Go to the `modules\sockets.js` file to add a require to the module you have written and add any `switch` in the code
`case` with the name you gave in the brand field and refer to the appropriate method that you wrote
* `Credits & Licence` : I used external libraries to communicate with sockets, and changed the code slightly to fit this project, so I will give a link to the original code repositiry and in addition to the fork I created for the changes,
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

### TODO:
- [x] yeelight need refresh after start app
- [ ] writing ui (client side)
- [ ] logs and comments
