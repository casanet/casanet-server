# Home IoT Server
Generic IoT devices Node.js server with basic REST api 

### Suppoted Right now
* Orvibo wiwo - S20
* Broadlink SP3
* Kankun Smart Wifi Plug
* Xiaomi Yeelight Smart LED Ceiling Light -- soon
* Xiaomi Philips LED Ceiling Lamp -- soon

### Operating instructions and use:

* `Purpose`: Instead of managing each smart socket (or any device with an on / off option) in a separate API for each brand, even though their operation is quite similar, we will consolidate all into one API and only behind the scenes will we perform the logical operations of the I / O for each brand according to its protocol. 
Which is why I completely ignored the advanced capabilities of the smart devices from all the companies and left only a simple API to turn on and off

* `Run it` : This part is for the Windows operating system, of course you can run the server on Linux, but the connection with Orvibo Sockets is through .NET and it's a bit of a problem in Linux, so I did not try the server in Linux but everything else should work.

1. Install Node.js
1. Install Python 2.7 At: `C:/Python27` (or change the value in: `modules\Commons\pythonHandler.js` line 7)
1. Install .Net
1. Go to location of the files in CMD and enter `npm install`
1. Go to `DB\sockets.json` file and change the values to the correct data and save the structure
1. Run the server by pressing `node app.js` or clicking the ActiveServer.bat file

If there are errors in the cmd window, note that you have set all the variables that the external libraries I have used have been properly arranged (the links to these projects are attached at the end of the page)


* `Using`   : so, after the server runing we can access to all devices in sockests.json file simply, 
to get all devices status GET http://127.0.0.1:3000/decives 
to get device status GET http://127.0.0.1:3000/decives/{macAddress}
to switch device status PUT http://127.0.0.1:3000/decives/{macAddress} with {state : 'on' } in body to turn on or {state : 'off' } to turn off
and POST http://127.0.0.1:3000/refreshDevices to scan again all devices  in LAN,
In addition to get update (by SSE obj) of changes in devices status GET http://127.0.0.1:3000/update (you can simply enter this url in chrom and see updates in live)
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

At the moment only 3 devices from three companies (Broadlink Orvibo Kankun) are supported because this is what I have in my house ... but easily (I hope) you can add support for any type of device that supports the option of turning on and off through WIFI and if I have more devices I will add them Here
