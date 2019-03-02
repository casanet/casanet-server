// @ts-ignore
/* jslint:disable */
const dgram = require('dgram');
const crypto = require('crypto');

// RM Devices (without RF support)
const rmDeviceTypes = {};
rmDeviceTypes[parseInt(0x2737, 16)] = 'Broadlink RM Mini';
rmDeviceTypes[parseInt(0x273d, 16)] = 'Broadlink RM Pro Phicomm';
rmDeviceTypes[parseInt(0x2712, 16)] = 'Broadlink RM2';
rmDeviceTypes[parseInt(0x2783, 16)] = 'Broadlink RM2 Home Plus';
rmDeviceTypes[parseInt(0x277c, 16)] = 'Broadlink RM2 Home Plus GDT';
rmDeviceTypes[parseInt(0x278f, 16)] = 'Broadlink RM Mini Shate';

// RM Devices (with RF support)
const rmPlusDeviceTypes = {};
rmPlusDeviceTypes[parseInt(0x272a, 16)] = 'Broadlink RM2 Pro Plus';
rmPlusDeviceTypes[parseInt(0x2787, 16)] = 'Broadlink RM2 Pro Plus v2';
rmPlusDeviceTypes[parseInt(0x278b, 16)] = 'Broadlink RM2 Pro Plus BL';
rmPlusDeviceTypes[parseInt(0x279d, 16)] = 'Broadlink RM3 Pro Plus';
rmPlusDeviceTypes[parseInt(0x27a9, 16)] = 'Broadlink RM3 Pro Plus v2'; // (model RM 3422)

// Known Unsupported Devices
const unsupportedDeviceTypes = {};
unsupportedDeviceTypes[parseInt(0, 16)] = 'Broadlink SP1';
unsupportedDeviceTypes[parseInt(0x2711, 16)] = 'Broadlink SP2';
unsupportedDeviceTypes[parseInt(0x2719, 16)] = 'Honeywell SP2';
unsupportedDeviceTypes[parseInt(0x7919, 16)] = 'Honeywell SP2';
unsupportedDeviceTypes[parseInt(0x271a, 16)] = 'Honeywell SP2';
unsupportedDeviceTypes[parseInt(0x791a, 16)] = 'Honeywell SP2';
unsupportedDeviceTypes[parseInt(0x2733, 16)] = 'OEM Branded SP Mini';
unsupportedDeviceTypes[parseInt(0x273e, 16)] = 'OEM Branded SP Mini';
unsupportedDeviceTypes[parseInt(0x2720, 16)] = 'Broadlink SP Mini';
unsupportedDeviceTypes[parseInt(0x753e, 16)] = 'Broadlink SP 3';
unsupportedDeviceTypes[parseInt(0x2728, 16)] = 'Broadlink SPMini 2';
unsupportedDeviceTypes[parseInt(0x2736, 16)] = 'Broadlink SPMini Plus';
unsupportedDeviceTypes[parseInt(0x2714, 16)] = 'Broadlink A1';
unsupportedDeviceTypes[parseInt(0x4EB5, 16)] = 'Broadlink MP1';
unsupportedDeviceTypes[parseInt(0x2722, 16)] = 'Broadlink S1 (SmartOne Alarm Kit)';
unsupportedDeviceTypes[parseInt(0x4E4D, 16)] = 'Dooya DT360E (DOOYA_CURTAIN_V2) or Hysen Heating Controller';

const HexStringToBinArray = (data) => {
    var binArray = new Uint8Array(data.match(/[\da-f]{2}/gi).map(function (hex) {
        return parseInt(hex, 16)
    }))
    return binArray;
}

class Device {

    constructor(host, macAddress, callback, deviceReadyTimeout = 3000, isRFSupported = false) {

        this.initCallback = callback;
        this.host = host;
        this.mac = HexStringToBinArray(macAddress);
        //this.type = deviceType;
        //this.model = rmDeviceTypes[parseInt(deviceType, 16)] || rmPlusDeviceTypes[parseInt(deviceType, 16)];

        this.count = Math.random() & 0xffff;
        this.key = Buffer.from([0x09, 0x76, 0x28, 0x34, 0x3f, 0xe9, 0x9e, 0x23, 0x76, 0x5c, 0x15, 0x13, 0xac, 0xcf, 0x8b, 0x02]);
        this.iv = Buffer.from([0x56, 0x2e, 0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58]);
        this.id = Buffer.from([0, 0, 0, 0]);

        setTimeout(() => {
            if (this.initCallback === undefined)
                return;
            var callback = this.initCallback;
            this.initCallback = undefined;
            callback({ code: '3000', msg: 'Fail connect to device' });
        }, deviceReadyTimeout);

        this.setupSocket();

        // Dynamically add relevant RF methods if the device supports it
        if (isRFSupported) this.addRFSupport();
    }

    sendErrorToCallback(err) {
        if (this.initCallback !== undefined)
            this.initCallback(err);
        else if (this.sendDataCallback !== undefined)
            this.sendDataCallback(err);
        else if (this.enterLearningCallback !== undefined)
            this.enterLearningCallback(err);
        else if (this.sendLearningDataCallback !== undefined)
            this.sendLearningDataCallback(err);

        this.initCallback = this.sendDataCallback = this.enterLearningCallback = this.sendLearningDataCallback = undefined;
    }

    // Create a UDP socket to receive messages from the broadlink device.
    setupSocket() {
        const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        this.socket = socket;

        socket.on('message', (response) => {
            const encryptedPayload = Buffer.alloc(response.length - 0x38, 0);
            response.copy(encryptedPayload, 0, 0x38);

            const err = response[0x22] | (response[0x23] << 8);
            if (err != 0) {
                this.sendErrorToCallback({ code: '3003', msg: 'Fail to read device data' });
                return;
            }

            const decipher = crypto.createDecipheriv('aes-128-cbc', this.key, this.iv);
            decipher.setAutoPadding(false);

            let payload = decipher.update(encryptedPayload);

            const p2 = decipher.final();
            if (p2) payload = Buffer.concat([payload, p2]);

            if (!payload) {
                this.sendErrorToCallback({ code: '3003', msg: 'Fail to read device data' });
                return;
            }

            const command = response[0x26];

            if (command == 0xe9) {
                this.key = Buffer.alloc(0x10, 0);
                payload.copy(this.key, 0, 0x04, 0x14);

                this.id = Buffer.alloc(0x04, 0);
                payload.copy(this.id, 0, 0x00, 0x04);

                if (this.initCallback === undefined)
                    return;
                var callback = this.initCallback;
                this.initCallback = undefined;
                callback();

            } else if (command == 0xee || command == 0xef) {
                this.onPayloadReceived(err, payload);
            } else {
                this.sendErrorToCallback({ code: '3003', msg: 'Fail to read device data' });
            }
        });

        socket.bind();
        this.authenticate();

    }

    authenticate() {
        const payload = Buffer.alloc(0x50, 0);

        payload[0x04] = 0x31;
        payload[0x05] = 0x31;
        payload[0x06] = 0x31;
        payload[0x07] = 0x31;
        payload[0x08] = 0x31;
        payload[0x09] = 0x31;
        payload[0x0a] = 0x31;
        payload[0x0b] = 0x31;
        payload[0x0c] = 0x31;
        payload[0x0d] = 0x31;
        payload[0x0e] = 0x31;
        payload[0x0f] = 0x31;
        payload[0x10] = 0x31;
        payload[0x11] = 0x31;
        payload[0x12] = 0x31;
        payload[0x1e] = 0x01;
        payload[0x2d] = 0x01;
        payload[0x30] = 'T'.charCodeAt(0);
        payload[0x31] = 'e'.charCodeAt(0);
        payload[0x32] = 's'.charCodeAt(0);
        payload[0x33] = 't'.charCodeAt(0);
        payload[0x34] = ' '.charCodeAt(0);
        payload[0x35] = ' '.charCodeAt(0);
        payload[0x36] = '1'.charCodeAt(0);

        this.sendPacket(0x65, payload);
    }

    sendPacket(command, payload) {
        const { log, socket } = this;
        this.count = (this.count + 1) & 0xffff;

        let packet = Buffer.alloc(0x38, 0);

        packet[0x00] = 0x5a;
        packet[0x01] = 0xa5;
        packet[0x02] = 0xaa;
        packet[0x03] = 0x55;
        packet[0x04] = 0x5a;
        packet[0x05] = 0xa5;
        packet[0x06] = 0xaa;
        packet[0x07] = 0x55;
        packet[0x24] = 0x2a;
        packet[0x25] = 0x27;
        packet[0x26] = command;
        packet[0x28] = this.count & 0xff;
        packet[0x29] = this.count >> 8;
        packet[0x2a] = this.mac[5];
        packet[0x2b] = this.mac[4];
        packet[0x2c] = this.mac[3];
        packet[0x2d] = this.mac[2];
        packet[0x2e] = this.mac[1];
        packet[0x2f] = this.mac[0];
        packet[0x30] = this.id[0];
        packet[0x31] = this.id[1];
        packet[0x32] = this.id[2];
        packet[0x33] = this.id[3];

        let checksum = 0xbeaf;
        for (let i = 0; i < payload.length; i++) {
            checksum += payload[i];
            checksum = checksum & 0xffff;
        }

        const cipher = crypto.createCipheriv('aes-128-cbc', this.key, this.iv);
        payload = cipher.update(payload);

        packet[0x34] = checksum & 0xff;
        packet[0x35] = checksum >> 8;

        packet = Buffer.concat([packet, payload]);

        checksum = 0xbeaf;
        for (let i = 0; i < packet.length; i++) {
            checksum += packet[i];
            checksum = checksum & 0xffff;
        }
        packet[0x20] = checksum & 0xff;
        packet[0x21] = checksum >> 8;


        socket.send(packet, 0, packet.length, this.host.port, this.host.address, (err, bytes) => {
            if (err)
                this.sendErrorToCallback({ code: '3004', msg: 'Fail to send data to device via network' });
        });
    }

    onPayloadReceived(err, payload) {
        const param = payload[0];

        const data = Buffer.alloc(payload.length - 4, 0);
        payload.copy(data, 0, 4);

        // TODO add code 2 fro success
        switch (param) {
            case 1: {
                if (this.checkPowerCallback === undefined)
                    return;
                var callback = this.checkPowerCallback;
                this.checkPowerCallback = undefined;
                callback(undefined, payload[0x4] === 1 ? true : false);
                break;
            }
            case 2: {
                if (this.sendDataCallback === undefined)
                    return;
                var callback = this.sendDataCallback;
                this.sendDataCallback = undefined;
                callback();
                break;
            }
            case 3: {
                if (this.enterLearningCallback === undefined)
                    return;
                var callback = this.enterLearningCallback;
                this.enterLearningCallback = undefined;
                callback();
            }
            case 4: { //get from check_data
                const data = Buffer.alloc(payload.length - 4, 0);
                payload.copy(data, 0, 4);

                var hexdata = data.toString('hex');
                if (hexdata === '000000000000000000000000' || this.sendLearningDataCallback === undefined)
                    return;
                var callback = this.sendLearningDataCallback;
                this.sendLearningDataCallback = undefined;
                callback(undefined, hexdata);

                break;
            }
            case 26: { //get from check_data for rawRFData
                const data = Buffer.alloc(1, 0);
                payload.copy(data, 0, 0x4);
                if (data[0] !== 0x1) break;
                break;
            }
            case 27: { //get from check_data for rawRFData2
                const data = Buffer.alloc(1, 0);
                payload.copy(data, 0, 0x4);
                if (data[0] !== 0x1) break;
                break;
            }
        }
    }

    setPower(state, callback, timeout = 3000) {
        this.sendDataCallback = callback;
        var packet = Buffer.alloc(16, 0);
        packet[0] = 2;
        packet[4] = state ? 1 : 0;
        this.sendPacket(0x6a, packet);

        setTimeout(() => {
            if (this.sendDataCallback === undefined)
                return;
            var callback = this.sendDataCallback;
            this.sendDataCallback = undefined;
            callback({ code: '3000', msg: 'Fail connect to device' });
        }, timeout);
    };

    checkPower(callback, timeout = 3000) {
        this.checkPowerCallback = callback;

        var packet = Buffer.alloc(16, 0);
        packet[0] = 1;
        this.sendPacket(0x6a, packet);

        setTimeout(() => {
            if (this.checkPowerCallback === undefined)
                return;
            var callback = this.checkPowerCallback;
            this.checkPowerCallback = undefined;
            callback({ code: '3000', msg: 'Fail connect to device' });
        }, timeout);
    };

    // Externally Accessed Methods
    checkData() {
        const packet = Buffer.alloc(16, 0);
        packet[0] = 4;
        this.sendPacket(0x6a, packet);
    }

    sendData(data, callback, timeout = 3000) {
        this.sendDataCallback = callback;
        let packet = Buffer.from([0x02, 0x00, 0x00, 0x00]);
        packet = Buffer.concat([packet, HexStringToBinArray(data)]);
        this.sendPacket(0x6a, packet);

        setTimeout(() => {
            if (this.sendDataCallback === undefined)
                return;
            var callback = this.sendDataCallback;
            this.sendDataCallback = undefined;
            callback({ code: '3000', msg: 'Fail connect to device' });
        }, timeout);
    }

    enterLearning(timeout, callback, deviceReadyTimout = 1000) {
        this.sendLearningDataCallback = callback;
        this.enterLearningCallback = () => {
            setTimeout(() => {
                this.checkData();

                setTimeout(() => {
                    if (this.sendLearningDataCallback === undefined)
                        return;
                    var callback = this.sendLearningDataCallback;
                    this.sendLearningDataCallback = undefined;
                    callback({ code: '3002', msg: 'Fail to get IR data' });
                }, deviceReadyTimout);
            }, timeout)
        };


        let packet = Buffer.alloc(16, 0);
        packet[0] = 3;
        this.sendPacket(0x6a, packet);

        setTimeout(() => {
            if (this.enterLearningCallback === undefined)
                return;
            var callback = this.enterLearningCallback;
            this.enterLearningCallback = undefined;
            this.sendLearningDataCallback = undefined;
            callback({ code: '3000', msg: 'Fail connect to device' });
        }, deviceReadyTimout);
    }

    // checkTemperature() {
    //     let packet = Buffer.alloc(16, 0);
    //     packet[0] = 1;
    //     this.sendPacket(0x6a, packet);
    // }

    // cancelLearn() {
    //     const packet = Buffer.alloc(16, 0);
    //     packet[0] = 0x1e;
    //     this.sendPacket(0x6a, packet);
    // }

    addRFSupport() {
        this.enterRFSweep = () => {
            const packet = Buffer.alloc(16, 0);
            packet[0] = 0x19;
            this.sendPacket(0x6a, packet);
        }

        this.checkRFData = () => {
            const packet = Buffer.alloc(16, 0);
            packet[0] = 0x1a;
            this.sendPacket(0x6a, packet);
        }

        this.checkRFData2 = () => {
            const packet = Buffer.alloc(16, 0);
            packet[0] = 0x1b;
            this.sendPacket(0x6a, packet);
        }
    }
}

module.exports = Device;