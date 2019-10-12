# Deploy casanet server on a Linux OS based devices.

Tested on orenge pi zero + armbian image, orenge pi one + armbian image and raspebery pi B+ with rapsebian image.

## Pre requries

### Update system 
```sudo apt-get update``` 

Then

```sudo apt-get upgrade``` 

### Set correct Time Zone
```sudo dpkg-reconfigure tzdata``` 

### Install Node.js + NPM
```sudo curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -``` 

Then

```sudo apt-get install -y nodejs```

### Install GIT (if not installed yet on the image)
```sudo apt-get install -y git```

### Install tmux 

```sudo apt-get install -y tmux```


## Configure casanet server

### Create a tmux window
```tmux new -s casanet -d```
### Connect to the new window
```tmux a -t casanet```
### Clone the casanet server project
```git clone https://github.com/casanet/casanet-server.git```
### Go to the backend directory
```cd casanet-server/backend/```
### Install casanet server dependencies
```npm ci```

It is recomended to check the default environments of the server and change it by demand.
for it copy the .env.example file and edit the real env:
```cp .env.example .env```
Then edit real environments by ```nano .env``` or any other text editor.

> The orange pi armbian image, changes his mac address each boot, so I recommend to get the mac address and set it to the `PHYSICAL_ADDRESS` environment variable, else the default username and the identity against a [remote server](https://github.com/casanet/remote-server) will change each boot.

### Exist window
press `ctrl` + `b` + `d` to exit from the tmux window.

# Configure autostart on boot.
### Create the autostart script
Go to the `init.d` directory

```cd /etc/init.d/```

Then create and edit the script named `casanet`
```nano casanet```

In the editor paste the folloing content:
```bash
#!/bin/bash 
# auto start casanet server 
echo "Starting casanet server in casanet tmux window" 
case "$1" in 
'start') 
        killall node 
        tmux kill-session -t "casanet" 
        tmux new -s "casanet" -d 
        tmux send-keys -t "casanet" "cd /root/casanet-server/backend" C-m 
        tmux send-keys -t "casanet" "sudo node dist/index.js" C-m 
;; 
'stop') 
        killall node 
        tmux kill-session -t "casanet" 
esac 
```
Then give to file the exe premission 

```chmod +x casanet```

Now the script is ready.

Go to the `rc3.d` directory to link the script there.

```cd /etc/rc3.d/```

Create the link 

```ln -s /etc/init.d/casanet```

And change the link name to a boot pattern.

```mv casanet S01casanet```

Now reboot the device and chack that all work properly. Good Luck!.



