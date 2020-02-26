# Deploy casanet server on a Linux OS based devices

Tested on Orange  pi zero + armbian image, Orange pi one + armbian image and Raspberry pi B+ with rapsebian image.

## Pre requirements

### Update system 
```sudo apt-get update``` 

Then

```sudo apt-get upgrade``` 

### Set correct Time Zone
```sudo dpkg-reconfigure tzdata``` 

### Install Node.js + NPM (In case you wish to use the binary execution file, skip)
```sudo curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -``` 

Then

```sudo apt-get install -y nodejs```

### Install Git (In case you wish to use the binary execution file, skip)
```sudo apt-get install -y git```

### Install tmux 

```sudo apt-get install -y tmux```


## Configure casanet server

### Create a tmux window
```tmux new -s casanet -d```
### Connect to the new window
```tmux a -t casanet```
### Get the server
- Download the linux binary execution (`casanet-local-server-linux` file) from [here](https://github.com/casanet/casanet-server/releases)
- Download the `casanet.json` configuration file from [here](https://github.com/casanet/casanet-server/releases)
- Download the environments example file from [here](https://github.com/casanet/casanet-server/releases)
- Give `casanet-local-server-linux` file an execute permission (using `chmod -R 0777 ./casanet-local-server-linux`)

#### If you wish to build the source-code
- Run ```git clone https://github.com/casanet/casanet-server.git```
- Go to the frontend directory ```cd casanet-server/frontend/```
- Install casanet server dependencies ```npm ci```
- Build the forntend by ```npm run build```
- Go to the backend directory ```cd ../backend/``
- Install casanet server dependencies ```npm ci```
- Build the backend by ```npm run build```

It is recommended to check the default environments of the server and change it by demand.
for it copy the .env.example file and edit the real env:
```cp .env.example .env```
Then edit real environments by ```nano .env``` or any other text editor.

> The Orange pi armbian image, changes his mac address each boot, so I recommend to get the mac address and set it to the `PHYSICAL_ADDRESS` environment variable, else the default username and the identity against a [remote server](https://github.com/casanet/remote-server) will change each boot.

### Exit from the tmux window
press `ctrl` + `b` + `d` to exit from the tmux window.

# Configure autostart on boot.
### Create the autostart script
Go to the `init.d` directory

```cd /etc/init.d/```

Then create and edit the script named `casanet`
```nano casanet```

In the editor paste the following content:
```bash
#!/bin/bash 
# autostart casanet server 
echo "Starting casanet server in casanet tmux window" 
case "$1" in 
'start') 
        killall node 
        tmux kill-session -t "casanet" 
        tmux new -s "casanet" -d 
        tmux send-keys -t "casanet" "cd /root" C-m m # Or the "./casanet-server/backend" if you use the source-code 
        tmux send-keys -t "casanet" "sudo node ./casanet-local-server-linux" C-m # Or the "./dist/index.js" if you use the source-code
;; 
'stop') 
        killall node 
        tmux kill-session -t "casanet" 
esac 
```
Then give to file the exe permission 

```chmod +x casanet```

Now the script is ready.

Go to the `rc3.d` directory to link the script there.

```cd /etc/rc3.d/```

Create the link 

```ln -s /etc/init.d/casanet```

And change the link name to a boot pattern.

```mv casanet S01casanet```

Now reboot the device and check that all work properly. 

Good Luck!



