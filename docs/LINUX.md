# Prepare casanet server on a Linux OS based devices

Tested on Orange  pi zero + Armbian image, Orange pi one + Armbian image and Raspberry pi B+ with Raspbian image.

## Pre requirements

### Update system 
```sudo apt-get update``` 

Then

```sudo apt-get upgrade``` 

### Set correct Time Zone
```sudo dpkg-reconfigure tzdata``` 

### Install tmux 
```sudo apt-get install -y tmux```


## Configure casanet server

### Create a tmux window
```tmux new -s casanet -d```
### Connect to the new window
```tmux a -t casanet```
### Get the server
- Download the Linux binary execution (`casanet_linux_x64` or `casanet_linux_arm` for ARM processor based (such as raspberry pi) `casanet_linux_arm` file) from [here](https://github.com/casanet/casanet-server/releases)
- Download the `casanet.json` configuration file from [here](https://github.com/casanet/casanet-server/releases)
- Download the environments example file from [here](https://github.com/casanet/casanet-server/releases)
- Give to the `casanet_linux_arm` file an execute permission (using `chmod -R 0777 ./casanet_linux_arm` command)

It is recommended to check the default environments of the server and change it by demand.
for it copy the .env.example file and edit the real env:
```cp .env.example .env```
Then edit real environments by ```nano .env``` or any other text editor.

> The Orange pi Armbian image, changes his mac address each boot, so I recommend to get the mac address and set it to the `PHYSICAL_ADDRESS` environment variable, else the default username and the identity against a [remote server](https://github.com/casanet/remote-server) will change each boot.

### Exit from the tmux window
press `ctrl` + `b` + `d` to exit from the tmux window.

# Configure autostart on boot
### Create the autostart script
Go to the `init.d` directory

```cd /etc/init.d/```

Then create and edit the script named `casanet`
```sudo nano casanet```

In the editor paste the following content:
```bash
#!/bin/bash

# autostart casanet server 
echo "Starting casanet server in casanet tmux window" 
case "$1" in 
'start') 
        tmux kill-session -t "casanet" 
        tmux new -s "casanet" -d 
        tmux send-keys -t "casanet" "cd /casanet-dir" C-m # Go the the directory where the Casanet executable placed 
        tmux send-keys -t "casanet" "sudo ./casanet_linux_arm" C-m # Or casanet_linux_x64, the sudo used to allows Casanet to scan the network
;; 
'stop')  
        tmux kill-session -t "casanet" 
esac 
```
Give file an exe permission 

```sudo chmod +x casanet```

Now the script is ready.

Go to the `rc3.d` directory to link the script there.

```cd /etc/rc3.d/```

Create the link 

```sudo ln -s /etc/init.d/casanet```

And change the link name to a boot pattern.

```sudo mv casanet S01casanet```

Now reboot the device and check that all work properly. 

Good Luck!

#### If you wish to build the source-code on your own
- Run ```git clone https://github.com/casanet/casanet-server.git```
- Go to the backend directory ```cd ../backend/``
- Install casanet server dependencies ```yarn --frozen-lockfile```
- Build the backend by ```npm run build```
- Run ```npm run fetch:dashboard``` if you wants the server to serve frontend dashboard



