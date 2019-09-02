# CASANET server.
This is the casa-net local server to communicats and control IoT devices in a home. 

### Server installation:
1. Download the project via git or download files as a zip.
1. In Linux OS, make sure `net-tools` installed.
1. Install Node.js on the machine.
1. Navigate in a command line to `$/.../backend` and press `npm ci`.
1. Press `node dist/index.js` to run the server.

Then open the browser in `http://127.0.0.1:3000`.

### Configure server:

In `casanet.json` file you can edit the configuration of a few stuff.


#### Default user:
Can edit any property of the default user. 

Except for the user account in the email. this will be always the mac address of the machine.
(The reason is for security, the only owner of the machine should know the default username).

#### HTTP/HTTPS server ports:
You can edit port and HTTPS using.
Also can set it by environment variables:
* `HTTP_PORT`
* `HTTPS_PORT`
* `USE_HTTPS`

> HTTPS require `private.key` `certificate.crt` and `ca_bundle.crt` files to be in `$/.../backend/encryption/` directory.

#### Requests limit:
To block brute-force attacks there is a request limit per IP.

#### Home position:
To allows timings based on sun events (such as turn on a light in the sunset) the server needs to know the location area of the home.
It doesn't need to be the exact location but needs to be close enough.

To get your home latitude and longitude you can use https://www.latlong.net/.

#### Password hash salt
set `SALT_KEYS` env var for salt sessions hash. otherways the salt will generate randomly on runtime, and in next running, all sessions will be invalid. 

#### Specify devices network 
set `SUBNET_TO_SCAN` env var to specify the network to scan devices IP's in it. the format is `xxx.xxx.xxx`. 

if not set, the default network is the first current machine IP subnet.  

#### Specify physical address 
set `PHYSICAL_ADDRESS` env var to specify the physical (aka MAC) address to use.
if not set, the address will be the first real machine address.

#### Two factor authentication (MFA):
To Allows MFA protection the server needs access to the email account to send the code to user email before login is done.

Let's take for example how to config a Gmail account: (Of course, it will work for any other SMTP services).

First needs to turn on the IMAP/SMTP access service for the account, [see google instructions](https://support.google.com/mail/answer/7126229) and follow `Step 1` only.

If MFA is enabled for the Gmail account create an application key for the password. [see google instructions](https://support.google.com/accounts/answer/185833).

And use the following environment variables:
* `TFA_SMTP_SERVER` (value example: `smtp.gmail.com`)
* `TFA_USER_NAME` (value example: `my-usename@gmail.com`)
* `TFA_USER_KEY` (value example: `my-gmail-password or my-application-password`)

that's all.

## Devices connection:
Each IoT device should be connected to the local network before can add it to the casa-net server.
For each supported IoT device model connection and pairing instructions see [modules documentations](./src/modules/README.md).

## Fetch RF (IR / 433MHz etc.) commands from a commands repository.
When using RF transmitter to control home devices it's possible to record the command from the original remote control or generating random command.
So to avoid recording a lot of commands one by one there is another project to store commands and serve then on demand. see the [project page](https://github.com/casanet/rf-commands-repo).
The `rf-commands-repo` URL placed in the `casanet.json` configuration file.

If you want to update my repo, feel free to contact me. 

## API
The UI should wrap API. 

The full specs of API are documented in [swagger API file](./swagger.yaml).







