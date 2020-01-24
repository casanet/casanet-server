# Using scenario

- Buy new [supported](#supported-iot-devices-/-protocols) smart devices or use the `mock` brand.
- [Connect it to local network](./backend/src/modules/README.md) via official app.
- Scan the local network to find the new device. 
    ![Screenshot](./screenshots/instructions/scan_devices.png)

    And give a name for the device (optionally).
    ![Screenshot](./screenshots/instructions/set_device_name.png)

- Create a new minion** from the device.
    ![Screenshot](./screenshots/instructions/create_minion.png)

- Say hello to the new minion and change the current status ;)

- Create a new operation.
    ![Screenshot](./screenshots/instructions/create_operation.png)

- Create new timing that invoked the created operation
    ![Screenshot](./screenshots/instructions/create_timing.png)

- Enjoy.

> Minion is a logic device in the system, meaning that a device is a physical device and minion is a logic device that uses a physical device to switch home kit status. For example, an IR transmitter can be one physical device for a few minions, one to central AC control and second for secondary AC control so in it will be two totally different minions that use one physical device.
