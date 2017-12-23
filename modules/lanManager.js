var logger = require('./logs');

const netList = require('network-list');
var fs = require('fs')

var networkMacNameMap = {};
try {
    networkMacNameMap = require('../cache/cacheNetworkMacNameMap.json');
} catch (error) {
    logger.write.warn("Error while reading cacheNetworkMacNameMap.json file")
    networkMacNameMap = {}
}
var networkDevicesMap = {};

var SaveToCache = () => {
    fs.writeFile('cache/cacheNetworkMacNameMap.json', JSON.stringify(networkMacNameMap), 'utf-8', function (err) {
        if (err)
            logger.write.warn('Error to write cacheNetworkMacNameMap file');
    })
}

var ScanLanNetworkDevicesInfo = (callback) => {
    logger.write.debug('Start reading ARP info...');
    netList.scan({}, (err, arr) => {
        if (err) {
            callback({} ,err);
            return;
        }

        networkDevicesMap = {};
        arr.forEach((lanDevice) => {
            if (lanDevice.alive && lanDevice.mac) {
                var mac = lanDevice.mac.replace(/:/g, '').toLowerCase();
                networkDevicesMap[mac] = {
                    ip: lanDevice.ip,
                    vendor: lanDevice.vendor,
                    mac : mac,
                    name : mac in networkMacNameMap ? networkMacNameMap[mac] : "not set yet"
                }
            }
        });

        callback(networkDevicesMap);
    });
}

var GetLastLanNetworkDevicesInfo = (callback) => {
    callback(networkDevicesMap);
}

SetLanDeviceName = (mac, name, callback) => {
    networkMacNameMap[mac] = name;
    SaveToCache();
    if(mac in networkDevicesMap){
        networkDevicesMap[mac].name = name;
    }
    if(callback)
        callback();
}

module.exports = {
    ScanLanNetworkDevicesInfo : ScanLanNetworkDevicesInfo,
    GetLastLanNetworkDevicesInfo : GetLastLanNetworkDevicesInfo,
    SetLanDeviceName : SetLanDeviceName
}