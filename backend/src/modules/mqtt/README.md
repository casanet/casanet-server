## Philosophy

The [MQTT](http://mqtt.org/) protocol design for IOT devices, and it is very easy to implement, so connect the current project to MQTT system is should be a must ;).

## Implementation
The MQTT module is an MQTT client that subscribe to devices statuses updates and publish set/get status requests.

## Connect module to an MQTT broker
MQTT system is several clients that connect to one broker.

To connect the module to an exists broker set the `MQTT_BROKER_URI` env var (for example `mqtt://192.168.1.10:1883`).
To run internal broker empty the `MQTT_BROKER_URI` env var.
The default internal broker port is 1883 to change it sets `MQTT_INTERNAL_BROKER_PORT` env var.

## MQTT messages publish/subscribe structure

### MQTT module subscription
The MQTT module subscribes to the topic `stat/casanet/#`, to get the minion new status. 
while in the hashtag place should be the minion id.
For example a valid topic `stat/casanet/yg56rf`.

The body of the message should be a minion status (see swagger API for the structure).
For example (Filling only the current minion device type):
```javascript
    {
        "switch": {
          "status": "on"
        }
    }
```

### MQTT module publishing
The MQTT module publishes to the topic `set/casanet/[minionId]`, to set the minion a new status.
For example `set/casanet/yg56rf`.

The body of the message is a minion status to set (see swagger API for the structure).
For example (It filling only the current minion device type):
```javascript
    {
        "switch": {
          "status": "on"
        }
    }
```

And also MQTT module publishes to the topic  `set/casanet/[minionId]` to get the current status (with an empty body).

### MQTT converter
If the device MQTT client not allowing to match the above topic/data. 
It is possible to use a converter to convert the device topic/data to the casanet topic/data structure.

#### MQTT with tasmota simple switch
Currently there is a converter for a tasmota simple switch devices.

To use it:
1) create new minion in the dashboard, select brand `mqtt` and in the model `switch`. 
1) copy the new minionId (by pressing on the minion menu and then the device meta).    
1) in tasmota web interface set the broker IP. (note that if not set other broker to casanet, the broker is the casanet server IP).
1) in tasmota web interface change the topic name to `sonoff/[minionId]`. 
    - for example:
        ![Screenshot](../../../../docs/screenshots/mqtt/tasmota-config.JPG)
        

## Implement converter
It should be very simple.
1) create converter file, go to `backend/src/modules/mqtt/mqtt-converters` directory and copy the `tasmotaConverter.ts` and change the file name (to `xxxConverter.ts`) and the class name `XxxxConverter`.
1) in the `subscribeDeviceTopic` data member set the topic to subscribe.
1) in the `convertSetStatusToDevice` method implement the conversion from casanet set minion status to device set status topic/data request.
1) in the `convertStatusRequestToDevice` method implement the conversion from casanet get minion status to device get current status topic/data request.
1) in the `convertStatusToCasanet` method implement the conversion from the device current status message to casanet minion id and minion status struct.
1) in the `../mqtt/mqttHandler.ts` (line ~145) add an instance of the `XxxConverter` class to converters collection.
1) feel free for asking help or opening PR ;)
