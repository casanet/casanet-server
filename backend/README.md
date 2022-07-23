# Casanet server - backend

This is the Casanet local server to communicate and control Smart Home devices in home.

[![CI CD Status](https://github.com/casanet/casanet-server/workflows/casanet%20server%20CI%20CD/badge.svg?branch=master)](https://github.com/casanet/casanet-server/actions)
[![Coverage Status](https://coveralls.io/repos/github/casanet/casanet-server/badge.svg?branch=master)](https://coveralls.io/github/casanet/casanet-server?branch=master)

### Server installation

> In Linux OS, make sure `net-tools` installed (in ubuntu install it by `apt-get install net-tools`)

There are ready to use binaries [here](https://github.com/casanet/casanet-server/releases) just download the binary file (depend on your OS) and the `casanet.json` configuration file. 

If you prefer to build the server by your own:

1. Download the project via git or download files as a zip
1. Install [Node.js](https://nodejs.org/en/download/) on machine
1. Navigate in a command line to `$/casanet-server/backend` and press `yarn --frozen-lockfile`
1. Run `npm run build` command
1. If you wish to access the dashboard using the local network, run ```npm run fetch:dashboard``` to fetch the latest dashboard, or to build dashboard by tour own build the frontend too
    1. Pull repository `git clone https://github.com/casanet/dashboard-app.git`.
		1. Run `yarn` & `yarn run build`.
		1. Copy the new bundle assets to the `$/casanet-server/backend/dist/www` directory.
1. Run `node dist/index.js` to start the server.

Then open the browser in `http://127.0.0.1`.

### Configure server

The configuration is based on the environment variable.

All variables with example value placed in the [.env.example](./.env.example) file.

You can load the environment using a `.env` file.

Also in the [casanet.json](./casanet.json) file, you can edit the configuration of a few stuff (if not set by the environments variables).

#### Default user

The default user placed in the [casanet.json](./casanet.json) configuration file, but the password for the default user is the machine mac address.
This password is insecure and will marked as "need to be replaced", so an alert will shown in the UI dashboard till the admin will set a new valid password.

The reason for using the machine mac as default pass, is to the default user password less vulnerable, the only owner of the machine should know the machine address.


#### HTTP/HTTPS server ports

You can edit port and HTTPS using.
Also can set it by environment variables:

- `HTTP_PORT`
- `HTTPS_PORT`
- `USE_HTTPS`

> HTTPS require `private.key` `certificate.crt` and `ca_bundle.crt` files to be in `$/.../backend/encryption/` directory.

#### Requests limit

To block brute-force attacks there is a request limit per IP.

#### Home position

To allows timings based on sun events (such as turn on a light in the sunset) the server needs to know the location area of the home.
It doesn't need to be the exact location but needs to be close enough.

To get your home latitude and longitude you can use https://www.latlong.net/.

#### Password hash salt

set `SALT_KEYS` env var for salt sessions hash. otherways the salt will generate randomly on runtime, and in the next running, all sessions will be invalid.

#### Specify devices network

set `SUBNET_TO_SCAN` env var to specify the network to scan devices IP's in it. the format is `xxx.xxx.xxx`.

if not set, the default network is the first current machine IP subnet.

#### Specify physical address

set `PHYSICAL_ADDRESS` env var to specify the physical (aka MAC) address to use.
if not set, the address will be the first real machine address.

#### Two factor authentication (2FA)

To Allows 2FA protection the server needs access to the email account to send the code to user email before login is done.

Let's take for example how to configure a Gmail account: (Of course, it will work for any other SMTP services).

First needs to turn on the IMAP/SMTP access service for the account, [see google instructions](https://support.google.com/mail/answer/7126229) and follow `Step 1` only.

If MFA is enabled for the Gmail account to create an application key for the password. [see google instructions](https://support.google.com/accounts/answer/185833).

And use the following environment variables:

- `TFA_SMTP_SERVER` (value example: `smtp.gmail.com`)
- `TFA_USER_NAME` (value example: `my-usename@gmail.com`)
- `TFA_USER_KEY` (value example: `my-gmail-password or my-application-password`)

that's all.

> Notice, that when using an email service from outside the local network for the 2FA, it means that the local server is required to access the internet while a user tries to login.

## Devices connection

Each IoT device should be connected to the local network before it can add it to the Casanet server.
For each supported IoT device model connection and pairing instructions see [modules documentation](./src/modules/README.md).

## Fetch RF (IR / 433MHz etc.) commands from a commands repository

When using RF transmitter to control home devices it's possible to record the command from the original remote control or generating random command.
So to avoid recording a lot of commands one by one there is a service to store commands and serve them on demand. see the [rf-commands-repo](https://github.com/casanet/rf-commands-repo) repository.

The `rf-commands-repo` URL placed in the `casanet.json` configuration file.

If you want to update the repo, feel free to contact me.

## Version update
There is an API to easily update the version to the latest release.

To run a command after the files update to apply the changes,
set the command in the `RESET_MACHINE_ON_VERSION_UPDATE` environment variable, and the backend will invoke it after version update.
Usually, it is something like `sudo reboot` to restart machine.

*THIS IS A DANGEROUS ACTION! MAKE SURE YOU KNOW THE COMMAND*

## On app failure
When an unknown failure thrown in the app, from any reason, there is an option to execute a command to restart the app/process/machine.

To run a command on app failure,
set a command in `RESET_APP_ON_FAILURE` environment, and the backend will invoke it pn failure.
Usually, it is something like `sudo reboot` for restarting the machine.

*THIS IS A DANGEROUS ACTION! MAKE SURE YOU KNOW THE COMMAND*

## Default lock sync/calibration sampling 

The default lock calibration activation (used by timings and operation set lock).

You can edit in the `defaultLockCalibrationMinutes` field in the `casanet.json` configuration file.

## API

The full specs of API are documented in [swagger API file](./src/swagger.json).

To explorer the full API specs use [swagger UI](https://petstore.swagger.io/) and put `https://raw.githubusercontent.com/casanet/casanet-server/master/backend/src/swagger.json` in explorer input.

In a running Casanet server you can use Swagger UI to call API, the URL is `[local server IP]/docs`. 
