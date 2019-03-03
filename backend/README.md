# CASTANET server.
This is the casa-net local server the communicats and control IoT devices in home. 

### Server installation:
1. Download project via git or downalod files as zip.
1. Install Node.js on machine.
1. Navigate in command line to `$/.../backend` and press `npm install --save`.
1. Press `node dist/index.js` to run server.

Then open browser in `http://127.0.0.1:3000`.

### Configure server:

In `casanet.json` file you can edit configuration of few stuff.

#### Default user:
You can edit any property of default user. 

Except user account in email. this will be always the mac address of machine.
(The reason is for security, only owner of machine should know the default username).

#### HTTP/HTTPS server ports:
You can edit port and HTTPS using.
Also you can set it by environment variables:
* `HTTP_PORT`
* `HTTPS_PORT`
* `USE_HTTPS`

HTTPS require `private.key` `certificate.crt` and `ca_bundle.crt` files to be in `$/.../backend/encryption/` directory.

#### Requests limit:
To block brute-force attacks there is a requests limit per IP.

#### Home position:
To allows timings based on sun events (such as turn on light in sunset) the server needs to know location area of home.
It doesn't need to be exact location but needs to be close enough.

To get yours home latitude and longitude you can use https://www.latlong.net/.

#### Two factor authentication:
To Allows MFA protection the server needs access to email account to send the code to user email before login.
(Tested with gmail account).

To confiugure it use follwing  environment variables:
* `TFA_SMTP_SERVER` (value example: `smtp.gmail.com`)
* `TFA_USER_NAME` (value example: `my-usename@gmail.com`)
* `TFA_USER_KEY` (value example: `my-gmail-password`)


## Devices connection:
Each IoT device should be connected to local router before can add it to casa-net.
For each supported IoT device model connection and pairing instructions see [modules documentations](./src/modules).

## API
The UI should wrap API. 

The full specs of API is documented in [swagger API file](./swagger.yaml).







